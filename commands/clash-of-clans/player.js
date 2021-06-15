const { MessageEmbed } = require('discord.js');
const { cocToken } = require('../../config.json');
const { Client } = require('clashofclans.js');
const { stripIndents } = require('common-tags');
const { Permissions } = require('discord.js');
const coc = new Client({
	token: cocToken, baseURL: 'https://coc.clashperk.com/v1'
});
const { labels } = require('../emojis/coc-labels');
const paginationEmbed = require('../../utils/paginate');

module.exports = {
	name: 'coc-player',
	description: 'Provides information about your Clash of Clans profile',
	usage: '<playerTag>',
	example: '#YO8LLQCJO',
	category: 'Game',
	aliases: ['player'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [],
	cached: new Map(),
	async execute({ message, args, client }) {
		let tags = args[0] ? [args[0]] : [];

		if (!tags.length) {
			tags = await client.utils.clanLogger.fetch(message.author.id);
		}

		if (!tags.length) return message.channel.send('⚠️ Please provide a tag!');

		const pages = [];
		for (const tag of tags) {
			const data = await coc.player(tag).catch(err => {
				console.log(err);
				return { ok: false, status: err.code, name: err.message };
			});
			if (data.status === 503) {
				return message.channel.send('⚠️ **Clash of Clans** API is down!');
			}
			if (!data.ok && data.status === 404) {
				return message.channel.send('⚠️ Please provide a valid tag!');
			}

			if (!data.ok && data.status !== 404) {
				return message.channel.send(`${data.reason}`);
			}
			const embed = new MessageEmbed()
				.setColor(global.config.color)
				.setTitle(`${data.name} - ${data.tag}`)
				.setThumbnail('https://cdn.discordapp.com/attachments/717460150528639077/751713217096712213/unnamed.png')
				.setDescription(stripIndents`
					**[TH2](https://discord.gg/dusNMvr7ur)**
					[Player Link Here](https://link.clashofclans.com/en?action=OpenPlayerProfile&tag=${encodeURIComponent(data.tag)})
					${data.labels.map(m => labels[m.name]).join(' ')}

					Name:
					\`${data.name}\`

					XP:
					\`${data.expLevel}\`

					Home Village:
					\`${data.trophies}\`

					Builder Base:
					\`${data.versusTrophies}\`

					Attacks:
					\`${data.attackWins}\`

					Defences:
					\`${data.defenseWins}\`

					War Stars:
					\`${data.warStars}\`

					Troops donated:
					\`${data.donations || 'None'}\`

					Troops received:
					\`${data.donationsReceived || 'None'}\`
				  `);

			pages.push(embed);
		}

		if (pages.length === 1) {
			return message.channel.send({ embed: pages[0] });
		}
		return paginationEmbed(message, pages);
	}
};
