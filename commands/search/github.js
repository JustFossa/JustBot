const Discord = require('discord.js');
const { Permissions } = require('discord.js');
module.exports = {
	name: 'search-github',
	description: 'Searches Github for user accounts',
	usage: '<keyword>',
	example: 'RC-02',
	category: 'Utility',
	aliases: ['git', 'github'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [],
	execute({ message, args, rawArgs }) {
		if (!args.length) return message.channel.send('Please specify what you would like to search!');
		const query = args.join(' ').replace(/ +/, '-');
		const embed = new Discord.MessageEmbed().setColor(global.config.color);

		embed.setDescription(
			`GitHub Search: **[${rawArgs}](https://github.com/${args})**`
		);

		return message.channel.send(embed);
	}
};
