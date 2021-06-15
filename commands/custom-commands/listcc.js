/* eslint-disable no-unused-vars */
const { Permissions } = require('discord.js');


module.exports = {
	name: 'list-custom-commands',
	description: 'Lists the existing custom commands in your server',
	usage: '',
	example: '',
	category: 'Utility',
	aliases: ['cclist', 'listcc', 'tags'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [],
	async execute({
		message,
		args,
		config,
		utils: { settings: settingsManager }
	}) {
		config.hold.add(`${message.guild.id}:message_deleted`);
		await message.delete().catch(() => config.hold.delete(`${message.guild.id}:message_deleted`));
		try {
			const settings = await settingsManager.fetch(message.guild.id);
			let list = '';

			for (let i = 0; i < settings.ccommands.length; i++) {
				list += `\`${i + 1}. ${settings.ccommands[i].name}\`\n`;
			}

			if (settings.ccommands.length < 1) {
				return message.channel.send(
					'This server does not have any custom commands!'
				);
			}

			return message.channel.send({
				embed: {
					color: global.config.color,
					title: 'Custom Commands',
					description: list
				}
			});
		} catch (e) {
			return message.channel.temp(
				'This server does not have any custom commands!'
			);
		}
	}
};
