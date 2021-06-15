const Discord = require('discord.js');
const config = require('../../config');
const { Permissions, Collection } = require('discord.js');
const emojis = require('../emojis/emojis');

const THUMBNAIL = 'https://images-ext-2.discordapp.net/external/TkQDdgBr9fewDcDCCxABdnEWKUpiaZJoGXhgG8Uu_7Y/https/cdn.discordapp.com/icons/827257197565837312/6e38395499a9371c6768b1bdf6add4b7.png';

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
	name: 'owner',
	description: 'Provides the owner help command',
	aliases: ['ownerh', 'owner-help'],
	category: 'Owner Only',
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [],
	async execute({ message, client, args, utils: { settings: settingsManager } }) {
		if (!Object.values(client.config.owners).includes(message.author.id)) return;

		const settings = await settingsManager.fetch(message.guild.id);
		const prefix = settings.prefix || config.prefix;

		const alias = args[0]?.toLowerCase().trim();
		const command = client.commands.get(alias) || client.commands.get(client.aliases.get(alias));
		if (command) return this.getDesc(message, command, prefix);

		const embed = new Discord.MessageEmbed()
			.setColor(global.config.color)
			.setTitle('TH2 OWNER HELP')
			.setThumbnail(THUMBNAIL);
		const commands = Array.from(client.commands.filter(cmd => cmd.category?.toLowerCase() === alias).values());
		if (commands.length) {
			embed.setDescription([
				commands.map(
					(cmd, i) => `**\`${++i}. ${cmd.name.replace(/-/g, ' ').toLowerCase().replace(/\b(\w)/g, char => char.toUpperCase())}\`**`
				).join('\n'),
				'',
				'***Reply with the corresponding number of the command you need help with!***'
			]);

			const msg = await message.channel.send({ embed });
			return this.nextPage(client, message, msg, commands, prefix);
		}

		embed.setDescription([
			'Which module would you like help with?',
			'',
			'**`1. Bot Owner`**',
			'',
			'***Reply with the corresponding number of the module you would like to view!***'
		]);

		const msg = await message.channel.send({ embed });
		return this.menuPage(client, message, msg, prefix);
	},

	async getDesc(message, command, prefix) {
		const embed = new Discord.MessageEmbed()
			.setThumbnail(THUMBNAIL)
			.setColor(global.config.color)
			.setDescription([
				` **TH2 ${command.name.replace(/-/g, ' ').toLowerCase().replace(/\b(\w)/g, char => char.toUpperCase())} Command**`,
				'',
				'**Description**',
				`\`${command.description}\``,
				'',
				'**Aliases**',
				command.aliases?.length ? command.aliases.map(alias => `\`${alias}\``).join('\n') : '`None`',
				'',
				'**Usage**',
				`\`${prefix}${command.name} ${command.usage ?? ''}\``,
				'',
				'**Example**',
				`\`${prefix}${command.name} ${command.example ?? ''}\``
			]);

		return message.channel.send({ embed });
	},

	async menuPage(client, message, msg, prefix) {
		const embed = new Discord.MessageEmbed();
		embed.setColor(global.config.color)
			.setThumbnail(THUMBNAIL);

		const categories = [
			{ name: 'Owner Only' }
		];

		try {
			const awaited = await message.channel.awaitMessages(
				msg => msg.author.id === message.author.id,
				{ max: 1, time: 60000, errors: ['time'] }
			);

			const m = awaited.first();
			await m.delete();

			if (m.content.toLowerCase() === 'stop') {
				return msg.edit(`${emojis.tick} Command successfully terminated!`, { embed: null });
			}

			const category = categories[m?.content - 1] || categories.find(en => en.name.toLowerCase() === m?.content.toLowerCase());
			if (!category) {
				return msg.edit(
					`${emojis.cross} Type a valid number, please run the \`${prefix}help\` command again.`,
					{ embed: null }
				);
			}

			const commands = Array.from(client.commands.filter(cmd => cmd.category === category.name).values());
			embed.setDescription([
				commands.map(
					(cmd, i) => `**\`${++i}. ${cmd.name.replace(/-/g, ' ').toLowerCase().replace(/\b(\w)/g, char => char.toUpperCase())}\`**`
				).join('\n'),
				'',
				' Reply with the corresponding number of the command you need help for.'
			]);

			const edited = await msg.edit({ embed });
			return this.nextPage(client, message, edited, commands, prefix);
		} catch (error) {
			return msg.edit(
				`${emojis.cross} Command timed-out, please run the \`${prefix}help\` command and try again!`,
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
			await m.delete();

			if (m.content.toLowerCase() === 'stop') {
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
				`<**TH2 ${command.name.replace(/-/g, ' ').toLowerCase().replace(/\b(\w)/g, char => char.toUpperCase())} Command**`,
				'',
				'**Description**',
				`\`${command.description}\``,
				'',
				'**Aliases**',
				command.aliases?.length ? command.aliases.map(alias => `\`${alias}\``).join('\n') : '`None`',
				'',
				'**Usage**',
				`\`${prefix}${command.aliases[0] ?? command.name} ${command.usage ?? ''}\``,
				'',
				'**Example**',
				`\`${prefix}${command.aliases[0] ?? command.name} ${command.example ?? ''}\``
			]);

			return msg.edit({ embed });
		} catch (error) {
			return message.channel.send(
				`${emojis.cross} Command timed-out, please run the \`${prefix}help\` command and try again!`,
				{ embed: null }
			);
		}
	}
};
