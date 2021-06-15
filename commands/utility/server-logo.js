const Discord = require('discord.js');
const { Permissions } = require('discord.js');

module.exports = {
	name: 'server-logo',
	description: 'Returns the logo of the current server',
	usage: '',
	example: '',
	category: 'Utility',
	aliases: ['slogo'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [],
	execute({ message }) {
		const embed = new Discord.MessageEmbed()
			.setColor(global.config.color)
			.setTitle('Server icon')
			.setImage(message.guild.iconURL({ size: 2048 }));

		return message.channel.send(embed);
	}
};
