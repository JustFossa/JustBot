const Discord = require('discord.js');
const { Permissions } = require('discord.js');
module.exports = {
	name: 'bot-logo',
	description: 'Provides the bots logo',
	usage: '',
	example: '',
	category: 'Utility',
	aliases: ['blogo'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [],
	execute({ message, args }) {
		message.channel.send(
			new Discord.MessageEmbed()
				.setColor(global.config.color)
				.setImage(
					message.client.user.displayAvatarURL({ format: 'png', size: 2048 })
				)
		);
	}
};
