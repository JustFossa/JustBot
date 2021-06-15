const Discord = require('discord.js');
const { Permissions } = require('discord.js');
module.exports = {
	name: 'youtube-search',
	description: 'Performs a search on Youtube',
	usage: '<keyword>',
	example: 'barcelona',
	category: 'Utility',
	aliases: ['yt', 'youtube'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [],

	execute({ message, args, rawArgs }) {
		if (!args.length) return message.channel.send('Please specify what you would like to search!');

		const query = args.join(' ').replace(' ', '+');
		const embed = new Discord.MessageEmbed().setColor(global.config.color);

		embed.setDescription(
			`YouTube Search: **[${rawArgs}](https://www.youtube.com/results?search_query=${encodeURI(
				query
			)})**`
		);

		return message.channel.send(embed);
	}
};
