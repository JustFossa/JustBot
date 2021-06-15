const Discord = require('discord.js');
const { Permissions } = require('discord.js');
module.exports = {
	name: 'search-discord-support',
	description: 'Searches Discord Support for help',
	usage: '<keyword>',
	example: '',
	category: 'Utility',
	aliases: ['dsupport', 'd-support', 'discord'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [],
	execute({ message, args, rawArgs }) {
		if (!args.length) return message.channel.send('Please specify what you would like to search!');
		const query = args.join(' ').replace(/ +/, '-');
		const embed = new Discord.MessageEmbed().setColor(global.config.color);

		embed.setDescription(
			`**Discord Support:\n\n[${rawArgs}](https://support.discord.com/hc/en-us/search?utf8=%E2%9C%93&query=${query}&filter_by=knowledge_base)**`
		);

		return message.channel.send(embed);
	}
};
