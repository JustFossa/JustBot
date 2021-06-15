const Discord = require('discord.js');
const config = require('../../config');
const { Permissions, Collection } = require('discord.js');
const emojis = require('../emojis/emojis');

const THUMBNAIL = 'https://cdn.discordapp.com/attachments/724146808598560789/798997058697691196/9c4e09471f47b54423a77b9141dd5215.png';

const dmCooldown = new Collection();

function hasDoneHelp(author) {
	const cooldownAmount = 1000 * 60 * 60 * 24 * 15;
	const now = Date.now();

	if (!dmCooldown.has(author)) {
		dmCooldown.set(author, now);
		return false;
	}

	const expirationTime = dmCooldown.get(author) + cooldownAmount;

	if (now < expirationTime) {
		return true;
	}

	return false;
}


module.exports = {
	// name: 'help',
	description: 'Provides the help command',
	category: 'Utility',
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [],

	async execute({ message, client, args, utils: { settings: settingsManager } }) {
		if (!hasDoneHelp(message.author.id)) {
			try {
				await message.author.send('**Here is a link to the ALPH4 docs page:**\nhttps://docs.alph4.xyz/');
			} catch {}
		}

		const settings = await settingsManager.fetch(message.guild.id);
		const prefix = settings.prefix || config.prefix;

		const alias = args[0]?.toLowerCase().trim();
		const command = client.commands.get(alias) || client.commands.get(client.aliases.get(alias));
		if (command) return this.getDesc(message, command, prefix);

		const embed = new Discord.MessageEmbed()
			.setColor(global.config.color)
			.setTitle('ALPH4 HELP')
			.setThumbnail(THUMBNAIL);
		const commands = Array.from(client.commands.filter(cmd => cmd.category?.toLowerCase() === alias).values());
		if (commands.length) {
			embed.setDescription([
				commands.map(
					(cmd, i) => `**\`${++i}. ${cmd.name.replace(/-/g, ' ').toLowerCase().replace(/\b(\w)/g, char => char.toUpperCase())}\`**`
				).join('\n'),
				'',
				'<:ban:799375370914234388> ***Reply with the corresponding number of the command you need help with!***'
			]);

			const msg = await message.channel.send({ embed });
			return this.nextPage(client, message, msg, commands, prefix);
		}

		embed.setDescription([
			'Which module would you like help with?',
			'',
			'**`1. MODMAIL`**',
			'**`2. MODERATION`**',
			'**`3. WELCOME`**',
			'**`4. GAME`**',
			'**`5. UTILITY`**',
			'**`6. ECONOMY`**',
			'',
			'<:ban:799375370914234388> ***Reply with the corresponding number of the module you would like to view!***'
		]);

		const msg = await message.channel.send({ embed });
		return this.menuPage(client, message, msg, prefix);
	},

	async getDesc(message, command, prefix) {
		const embed = new Discord.MessageEmbed()
			.setThumbnail(THUMBNAIL)
			.setColor(global.config.color)
			.setDescription([
				`<:ban:799375370914234388> **${command.name.replace(/-/g, ' ').toLowerCase().replace(/\b(\w)/g, char => char.toUpperCase())}**`,
				'',
				`\`${command.description}\``,
				'',
				'<:spanner:825269475901308990> **Aliases**',
				command.aliases?.length ? command.aliases.map(alias => `\`${prefix}${alias}\``).join('\n') : '`None`',
				'',
				'<:gears:717436253376872500> **Usage**',
				`\`${prefix}${command.name} ${command.usage ?? ''}\``,
				'',
				'<:message:798994744649711673> **Example**',
				`\`${prefix}${command.name} ${command.example ?? ''}\``
			]);

		return message.channel.send({ embed });
	},

	async menuPage(client, message, msg, prefix) {
		const embed = new Discord.MessageEmbed();
		embed.setColor(global.config.color)
			.setThumbnail(THUMBNAIL);

		const categories = [
			{ name: 'ModMail' },
			{ name: 'Moderation' },
			{ name: 'Welcome' },
			{ name: 'Game' },
			{ name: 'Utility' },
			{ name: 'Economy' }
		];

		try {
			const awaited = await message.channel.awaitMessages(
				msg => msg.author.id === message.author.id,
				{ max: 1, time: 60000, errors: ['time'] }
			);

			const m = awaited.first();

			if (m.content.toLowerCase() === 'stop') {
				return msg.edit(`${emojis.tick} Command successfully terminated!`, { embed: null });
			}

			const category = categories[m?.content - 1] || categories.find(en => en.name.toLowerCase() === m?.content.toLowerCase());
			if (!category) {
				return msg.edit(
					`${emojis.cross} You must type a valid number, please run the \`${prefix}help\` command again!`,
					{ embed: null }
				);
			}

			const commands = Array.from(client.commands.filter(cmd => cmd.category === category.name).values());
			embed.setDescription([
				commands.map(
					(cmd, i) => `**\`${++i}. ${cmd.name.replace(/-/g, ' ').toLowerCase().replace(/\b(\w)/g, char => char.toUpperCase())}\`**`
				).join('\n'),
				'',
				'<:ban:799375370914234388> ***Reply with the corresponding number of the command you need help for!***'
			]);

			const edited = await msg.edit({ embed });
			return this.nextPage(client, message, edited, commands, prefix);
		} catch (error) {
			return msg.edit(
				`${emojis.cross} The command timed-out, please run the \`${prefix}help\` command and try again!`,
				{ embed: null }
			);
		}
	},

	async nextPage(client, message, msg, commands, prefix) {
		const embed = new Discord.MessageEmbed()
			.setColor(global.config.color)
			.setThumbnail(THUMBNAIL);
		try {
			const awaited = await message.channel.awaitMessages(
				msg => msg.author.id === message.author.id,
				{ max: 1, time: 60000, errors: ['time'] }
			);

			const m = awaited.first();

			if (m.content.toLowerCase() === 'stop') {
				await m.delete();
				return msg.edit(`${emojis.tick} Command successfully terminated!`, { embed: null });
			}

			const command = commands[m?.content - 1];
			if (!command) {
				return msg.edit(
					`${emojis.cross} You must type a valid number like \`3\` or \`5\`, run the \`${prefix}help\` command to try again!`,
					{ embed: null }
				);
			}

			embed.setDescription([
				`<:ban:799375370914234388> **${command.name.replace(/-/g, ' ').toLowerCase().replace(/\b(\w)/g, char => char.toUpperCase())}**`,
				'',
				`\`${command.description}\``,
				'',
				'<:spanner:825269475901308990> **Aliases**',
				command.aliases?.length ? command.aliases.map(alias => `\`${prefix}${alias}\``).join('\n') : '`None`',
				'',
				'<:gears:717436253376872500> **Usage**',
				`\`${prefix}${command.aliases[0] ?? command.name} ${command.usage ?? ''}\``,
				'',
				'<:message:798994744649711673> **Example**',
				`\`${prefix}${command.aliases[0] ?? command.name} ${command.example ?? ''}\``
			]);

			await m.delete();
			return msg.edit({ embed });
		} catch (error) {
			return message.channel.send(
				`${emojis.cross} Command timed-out, please run the \`${prefix}help\` command and try again!`,
				{ embed: null }
			);
		}
	}
};
