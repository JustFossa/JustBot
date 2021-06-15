const Discord = require('discord.js');
const config = require('../../config');
const { Permissions } = require('discord.js');
const emojis = require('../emojis/emojis');

module.exports = {
	name: 'help',
	description: 'Provides the help command',
	aliases: ['commands'],
	category: 'Help',
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [],

	async execute({ message, client, args, utils: { settings: settingsManager } }) {
		const settings = await settingsManager.fetch(message.guild.id);
		const prefix = settings.prefix || config.prefix;

		const alias = args[0]?.toLowerCase().trim();
		const command = client.commands.get(alias) || client.commands.get(client.aliases.get(alias));
		if (command) return this.getDesc(message, command, prefix);

		const embed = new Discord.MessageEmbed()
			.setColor(global.config.color)
			.setTitle(`**Server: ${message.guild.name}**`)
			// .setThumbnail(client.user.displayAvatarURL({ size: 512 }))
			.setDescription([
				`Prefix: **\`${settings.prefix || client.config.prefix}\`**`,
				`Commands: **\`${client.commands.size}\`**`,
				`List: https://docs.google.com/document/d/1LjdCjDGZn--3NJ2bo95enfZZtUOdmmtqILBlBuCZZbs/edit?usp=sharing`
			]);

		try {
			await message.author.send({ embed });
		} catch {
			return message.channel.send(`${emojis.cross} Please enable your DMs so I can send you the help command!`);
		}

		return message.channel.send(`${emojis.tick} I have sent you a DM!`);
	},

	async getDesc(message, command, prefix) {
		const embed = new Discord.MessageEmbed()
			.setThumbnail(message.client.user.displayAvatarURL({ size: 512 }))
			.setColor(global.config.color)
			.setDescription([
				`**${command.name.replace(/-/g, ' ').toLowerCase().replace(/\b(\w)/g, char => char.toUpperCase())}**`,
				'',
				`\`${command.description}\``,
				'',
				'**Aliases**',
				command.aliases?.length ? command.aliases.map(alias => `\`${prefix}${alias}\``).join('\n') : '`None`',
				'',
				'**Usage**',
				`\`${prefix}${command.name} ${command.usage ?? ''}\``,
				'',
				'**Example**',
				`\`${prefix}${command.name} ${command.example ?? ''}\``
			]);

		return message.channel.send({ embed });
	}
};
