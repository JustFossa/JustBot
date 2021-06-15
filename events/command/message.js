const { commandStats, commandUsage, commandError } = require('../../models/Usage');
const { MessageEmbed, Collection, Permissions } = require('discord.js');
const emojis = require('../../commands/emojis/emojis');
const cooldowns = new Collection();

function getISODate() {
	const currentTime = new Date();
	currentTime.setUTCHours(0, 0, 0, 0);
	return currentTime.toISOString();
}

// prevents discontinuity of the usage growth graph
setTimeout(async () => {
	await commandUsage.updateOne({ timestamp: getISODate() }, { $inc: { uses: 0 } }, { upsert: true });
}, 6 * 60 * 60 * 1000);

async function usageStats(command) {
	if (command.ownerOnly) return;
	await commandStats.updateOne({ name: command.name }, { $inc: { uses: 1 } }, { upsert: true });
	await commandUsage.updateOne({ timestamp: getISODate() }, { $inc: { uses: 1 } }, { upsert: true });
}

function parseWithPrefix(message, client, prefix) {
	const lowerContent = message.content.toLowerCase();
	if (!lowerContent.startsWith(prefix.toLowerCase())) {
		return { command: null, prefix: null };
	}

	const endOfPrefix = lowerContent.indexOf(prefix.toLowerCase()) + prefix.length;
	const startOfArgs = message.content.slice(endOfPrefix).search(/\S/) + prefix.length;
	const alias = message.content.slice(startOfArgs).split(/\s{1,}|\n{1,}/)[0];
	const command = client.commands.get(alias) || client.commands.get(client.aliases.get(alias));
	const content = message.content.slice(startOfArgs + alias.length + 1);
	const args = message.content.slice(startOfArgs + alias.length + 1).split(/ +/g);
	const afterPrefix = message.content.slice(prefix.length);

	if (!command) {
		return { command: null, prefix, alias, content, afterPrefix, args };
	}

	return { command, prefix, alias, content, afterPrefix, args };
}

function parseCommand(message, client, prefix) {
	const mentions = [`<@${client.user.id}>`, `<@!${client.user.id}>`];
	const prefixes = [...mentions, prefix];

	const results = prefixes.map(prefix => parseWithPrefix(message, client, prefix));
	const prefixedCommand = results.find(en => en.command);
	if (prefixedCommand) return prefixedCommand;
	return results.find(en => en.prefix);
}

const missingPermissions = permissions => {
	const missingPerms = permissions.map(name => {
		if (name === 'VIEW_CHANNEL') return '`READ MESSAGES`';
		if (name === 'MANAGE_GUILD') return '`MANAGE SERVER`';
		return `\`${name.replace(/_/g, ' ')}\``;
	});

	return missingPerms.length > 1
		? `${missingPerms.slice(0, -1).join(', ')} and ${missingPerms.slice(-1)[0]} permissions`
		: `${missingPerms[0]} permission`;
};

const runCoolDowns = (command, message) => {
	if (Object.values(global.config.owners).includes(message.author.id)) {
		return false;
	}

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			console.log('Cooldown', message.author.tag, timeLeft);
			return true;
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
	return false;
};

const runPermissionCheck = async (message, client, command, settings) => {
	if (command.disabled === true) {
		return message.channel.send(`${emojis.cross} Command under maintenance, please try again later.`);
	}

	if (command.ownerOnly === true && !client.isOwner(message.author.id)) {
		return false;
	}

	if (command.modBypass && message.guild.members.cache.get(message.author.id).roles.cache.has(settings.modRole)) {
		return true;
	}

	const clientPermissions = command.clientPermissions?.length
		? message.channel.permissionsFor(client.user)
			.missing(
				command.clientPermissions.reduce((pre, bit) => {
					if (typeof bit === 'string') pre |= Permissions.FLAGS[bit] ?? 0;
					return pre |= bit;
				}, 0)
			)
		: [];

	if (clientPermissions.length) {
		await message.channel.send(`${emojis.cross} The bot requires the ${missingPermissions(clientPermissions)} to use this command!`);
		return true;
	}

	const userPermissions = command.userPermissions?.length
		? message.channel.permissionsFor(message.author)
			.missing(
				command.userPermissions.reduce((pre, bit) => {
					if (typeof bit === 'string') pre |= Permissions.FLAGS[bit] ?? 0;
					return pre |= bit;
				}, 0)
			)
		: [];

	if (userPermissions.length) {
		await message.channel.send(`${emojis.cross} You require the ${missingPermissions(userPermissions)} to use this command!`);
		return true;
	}

	return false;
};

module.exports = async (client, message, fresh = true) => {
	if (message.author.bot) return;
	if (message.channel.type === 'dm') return;

	if (
		message.channel.type === 'text' &&
		!message.channel.permissionsFor(client.user).has(['SEND_MESSAGES'])
	) return;

	// I don't know what does it do?
	if (message.content === '^' && !message.channel.permissionsFor(client.user.id).has('MANAGE_MESSAGES')) {
		return message.delete();
	}

	// Auto-Mod 💩
	const blockChannel = await client.utils.channelBlock.active(message.channel.id);
	const blockCategory = await client.utils.categoryBlock.active(message.channel.parentID);
	const settings = await client.utils.settings.fetch(message.guild.id);
	if (!blockChannel && !blockCategory && !message.hasOwnProperty('token') && fresh) {
		if (await client.utils.automod.autoMod(message, settings)) return;
	}

	// Get The Prefix
	const prefix = settings.prefix || client.config.prefix;
	// Parse Command
	const parsed = parseCommand(message, client, prefix);
	if (!parsed?.command && !parsed?.prefix) return;

	// Custom Commands
	if (!parsed.command && settings.ccommands) {
		const ccommand = settings.ccommands.find(c => c.name === parsed.alias);
		if (!ccommand) return;
		return message.channel.send(ccommand.response);
	}

	// Finally The COMMAND... heh?
	const command = parsed.command;

	// Blacklisted Buddies ... 😎
	if (
		client.config.blacklists &&
		await client.utils.userBlacklists.active(message.author.id)
	) {
		return console.log(`${message.author.tag} (${message.author.id}) (Blacklisted)`);
	}

	console.log(`[${message.author.tag} (${message.author.id}) | ${message.guild.name}]: ${message.content}`);

	// Permission Check
	if (await runPermissionCheck(message, client, command, settings)) return;

	// Handle Cooldowns
	if (runCoolDowns(command, message)) return;

	// Block Channel
	if (command.name !== 'block-channel' && !client.isOwner(message.author.id) && blockChannel) return;

	// Block Category
	if (command.name !== 'block-category' && !client.isOwner(message.author.id) && blockCategory) return;

	if (!command.dm && message.channel.type === 'dm') return;

	if (command.args && !parsed.content) {
		let reply = `${emojis.cross} This command requires arguments!`;
		if (command.usage) {
			reply += `\n\nThe correct usage would be: \n**\`${prefix}${command.name} ${command.usage}\`**`;
		}
		return message.channel.send(reply);
	}

	if (command.logs && !await client.utils.logger.ensureEmbed(message.channel).catch(() => null)) return;

	// Increment Command Usage
	if (!client.isOwner(message.author.id)) usageStats(command);

	try {
		return await command.execute({
			client, message, settings,
			prefix: parsed.prefix,
			args: parsed.args,
			utils: client.utils,
			rawArgs: parsed.content,
			argString: parsed.content,
			color: client.config.color,
			config: client.config
		});
	} catch (err) {
		console.error(`Command Error: ${message.content}`);
		console.error(err);

		// Increment Error Count
		await commandError.updateOne({ timestamp: getISODate() }, { $inc: { count: 1 } }, { upsert: true });
		await message.channel.send([
			' An error occured, please do not use this command till its fixed!'
		]);

		const channel = client.channels.cache.get('836739835737669672');
		if (client.config.logging && channel) {
			return channel.send(
				{
					embed: {
						title: 'Live Error',
						description: [
							'**Executor**\n```',
							message.author.tag,
							'```',
							'**User ID**\n```',
							message.author.id,
							'```',
							'**Command**\n```',
							message.content,
							'```',
							'**Error**\n```',
							err,
							'```'
						].join('\n'),
						color: client.config.color
					}
				}
			);
		}
	}
};
