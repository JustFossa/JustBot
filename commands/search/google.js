const Discord = require('discord.js');
const { Permissions } = require('discord.js');
module.exports = {
	name: 'google-search',
	description: 'Performs a Google search',
	usage: '<keyword>',
	example: 'world time zones',
	category: 'Utility',
	aliases: ['google'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [],
	execute({ message, args, rawArgs }) {
		if (!args.length) return message.channel.send('Please specify what you would like to search!');
		const query = args.join(' ').replace(' ', '+');
		const embed = new Discord.MessageEmbed().setColor(global.config.color);

		embed.setDescription(
			`Google Search: **[${rawArgs}](https://www.google.com/search?q=${encodeURI(query)})**`
		);

		return message.channel.send(embed);
	}
};
