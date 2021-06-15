const fetch = require('node-fetch');
const { Util, MessageEmbed } = require('discord.js');
const { Permissions } = require('discord.js');
function split(content) {
	return Util.splitMessage(content, {
		maxLength: 2048
	});
}

module.exports = {
	name: 'lyrics',
	description: 'Retrieves the lyrics of the given song name',
	usage: '<songName>',
	example: 'faded',
	category: 'Utility',
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [],
	async execute({ message, args }) {
		if (args.length < 1) return message.channel.send('Please enter the name of the song!');
		const song = await fetch(`https://some-random-api.ml/lyrics?title=${args.join(' ')}`).then(r => r.json());
		if (!song || !song.lyrics) {
			message.channel.stopTyping();
			return message.channel.send('Please type the command correctly, `!lyrics <songName>`!');
		}

		const embed = new MessageEmbed()
			.setColor(global.config.color)
			.setAuthor('Lyrics')
			.setThumbnail(song.thumbnail ? song.thumbnail.genius : null)
			.setTitle(song.title || 'Unknown')
			.setURL();

		const result = split(song.lyrics);
		if (Array.isArray(result)) {
			if (result.length > 1) {
				embed.setDescription(result[0])
					.addField('\u200b', result[1].substring(0, 1024))
					.setDescription(result[0]);
			} else {
				embed.setDescription(result[0]);
			}
		}

		return message.channel.send(embed);
	}
};
