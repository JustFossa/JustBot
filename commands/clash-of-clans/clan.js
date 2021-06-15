const { MessageEmbed } = require('discord.js');
const { Permissions } = require('discord.js');
const { cocToken } = require('../../config.json');
const { Client } = require('clashofclans.js');
const { stripIndents } = require('common-tags');
const { labels } = require('../emojis/clash-of-clans');
const coc = new Client({
	token: cocToken
});

module.exports = {
	name: 'coc-clan',
	description: 'Provides information about a Clash of Clans clan',
	usage: '<clanTag>',
	example: '#222CVLVVU',
	category: 'Game',
	aliases: ['c', 'clan'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [],
	async execute({ message, args }) {
		const tag = args[0];
		if (!tag) return message.channel.send('Please provide a tag!');
		const data = await coc.clan(tag);

		if (data.status === 404) {
			return message.channel.send('Please provide a valid Clash of Clans tag!');
		}

		if (data.status === 503) {
			return message.channel.send('**Clash of Clans** API is down!');
		}

		if (!data.ok) return;

		const embed = new MessageEmbed()
			.setAuthor(`${data.name} `)
			.setColor(global.config.color)

			.setThumbnail('https://cdn.discordapp.com/attachments/717460150528639077/751713217096712213/unnamed.png')
			.setDescription(stripIndents`
			    **[TH2 Server](https://discord.gg/9zqArakDGM)**

				[Clan Link Here](https://link.clashofclans.com/en?action=OpenClanProfile&tag=${encodeURIComponent(data.tag)})
				${data.labels?.map(m => labels[m.name]).join(' ') ?? ''}

				**Description:**
				\`${data.description}\`

				**Tag:**
				\`${data.tag}\`

				**Members:**
				\`${data.members}/50\`

				**Total Points:**
				\`${data.clanPoints}\`

				**War Leagues:**
				\`${data.warLeague.name}\`

				**Location:**
				\`${data.location.name}\`

				**Wars Won:**
				\`${data.warWins}\`

				**War Losses:**
				\`${data.warLosses || 'Private War Log'}\`


      `);

		return message.channel.send({ embed });
	}

};
