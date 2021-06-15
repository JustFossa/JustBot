const { cocToken, brawlstarstoken, clashroyaletoken } = require('../../config.json');
const { Permissions } = require('discord.js');
const fetch = require('node-fetch');
const { Client } = require('clashofclans.js');
const coc = new Client({
	token: cocToken
});

module.exports = {
	name: 'bots-ping',
	description: 'Provides the ping for Aeo',
	usage: '',
	example: '',
	category: 'Utility',
	aliases: ['pong', 'bot-ping', 'ping'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [],
	async execute({ message }) {
		const m = await message.channel.send('Ping?');
		return m.edit([
			'Ping:',
			'',
			`• API Ping - \`${message.client.ws.ping}ms\``,
			`• Gateway Ping - \`${m.createdTimestamp - message.createdTimestamp}ms\``
		]);
	}
};
