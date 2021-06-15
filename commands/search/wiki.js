const Discord = require('discord.js');
const { Permissions } = require('discord.js');
module.exports = {
	name: 'wikipedia-search',
	description: 'Performs a search on Wikipedia',
	usage: '<keyword>',
	example: 'Jack Bauer',
	category: 'Utility',
	aliases: ['wiki', 'wikipedia'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [],
	execute({ message, args, rawArgs }) {
		if (!args.length) return message.channel.send('Please specify what you would like to search!');

		const query = args.join(' ').replace(' ', '_');
		const embed = new Discord.MessageEmbed().setColor(global.config.color);

		embed.setDescription(`Wiki Search: **[${rawArgs}](https://en.m.wikipedia.org/wiki/${encodeURI(query)})**`);

		message.channel.send(embed);
	}
};

