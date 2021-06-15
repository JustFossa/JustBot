const Discord = require('discord.js');
const { Permissions } = require('discord.js');
module.exports = {
	name: 'twitter-search',
	description: 'Performs a Twitter search on accounts',
	usage: '<keyword>',
	example: 'Aeobot',
	category: 'Utility',
	aliases: ['tweet', 'twitter'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [],
	execute({ message, args, rawArgs }) {
		if (!args.length) return message.channel.send('Please specify what you would like to search!');
		const query = args.join(' ').replace(/ +/, '-');
		const embed = new Discord.MessageEmbed().setColor(global.config.color);

		embed.setDescription(
			`Twitter Search: **[${rawArgs}](https://twitter.com/search?q=${args}&src=typed_query)**`
		);

		message.channel.send(embed);
	}
};
