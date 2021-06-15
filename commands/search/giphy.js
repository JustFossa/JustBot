const Discord = require('discord.js');
const { Permissions } = require('discord.js');
module.exports = {
	name: 'search-giphy',
	description: 'Searches Giphy',
	usage: '<keyword>',
	example: 'happy',
	category: 'Utility',
	aliases: ['gif', 'giphy'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [],
	execute({ message, args, rawArgs }) {
		if (!args.length) return message.channel.send('Please specify what you would like to search!');
		const query = args.join(' ').replace(/ +/, '-');
		const embed = new Discord.MessageEmbed().setColor(global.config.color);

		embed.setDescription(
			`Giphy Search: **[${rawArgs}](https://giphy.com/search/${encodeURI(
				query
			)})**`
		);

		return message.channel.send(embed);
	}
};
