const { Permissions, Util } = require('discord.js');
const EMOJI_REGEX = /<(?:a)?:(?:\w{2,32}):(\d{17,19})>?/;
module.exports = {
	name: 'emoji-add',
	description: 'Add any emojis to your server!',
	usage: '<emoji>',
	example: '<:youtube:717436253909418054>',
	category: 'Utility',
	aliases: ['add-emoji', 'emote-add', 'add-emote', 'emote', 'emojiadd'],
	args: true,
	userPermissions: [Permissions.FLAGS.MANAGE_EMOJIS, Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.MANAGE_MESSAGES],
	clientPermissions: [Permissions.FLAGS.MANAGE_EMOJIS],

	async execute({ message, args, client }) {
		const emoji = Util.parseEmoji(args[0]);
		if (!emoji) return message.channel.send('Please enter a valid emoji!');

		let newEmoji;
		try {
			newEmoji = await message.guild.emojis.create(`https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'png'}`, emoji.name);
		} catch (err) {
			if (err.code === 30008) return message.channel.send('Maximum number of emojis reached!');
			return message.channel.send('Please enter a valid emoji!');
		}

		await message.delete();
		return message.channel.send('Emoji successfully added to your server!').then(msg => setTimeout(() => msg.delete(), 3000));
	},

	parseEmoji(phrase) {
		if (EMOJI_REGEX.test(phrase)) {
			return {
				id: phrase.match(EMOJI_REGEX)[1],
				name: phrase.match(/:(.+):/)[1]
			};
		}
		return null;
	}
};
