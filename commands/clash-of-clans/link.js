const { cocToken } = require('../../config.json');
const { Client } = require('clashofclans.js');
const { Permissions } = require('discord.js');
const coc = new Client({
	token: cocToken
});

module.exports = {
	name: 'coc-player-link',
	description: 'Link your Discord account to your Clash of Clans account',
	usage: '<playerTag>',
	example: '#YO8LLQCJO',
	category: 'Game',
	aliases: ['link'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [],
	async execute({ message, args, client }) {
		const tag = args[0];
		message.delete();
		if (!tag) return message.channel.temp('Please provide a tag!');
		const data = await coc.player(tag).catch(err => {
			console.log(err);
			return { ok: false, status: err.code, name: err.message };
		});

		if (data.status === 503) {
			return message.channel.send('**Clash of Clans** API is down!');
		}

		if (!data.ok && data.status === 404) {
			return message.channel.send('Please provide a valid tag!');
		}

		if (!data.ok && data.status !== 404) {
			return message.channel.send(`${data.reason}`);
		}

		const res = await client.utils.clanLogger.link(message.author.id, data.tag);
		if (!res) return message.channel.temp('Could not link this Player!');
		return message.channel.temp('Player successfully linked to your profile!');
	}
};
