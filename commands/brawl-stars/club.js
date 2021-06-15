const { bsToken } = require('../../config.json');
const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');
const { Permissions } = require('discord.js');
module.exports = {
	name: 'brawl-stars-club',
	description: 'Provides information about a Brawl Stars Club',
	usage: '<clubTag>',
	example: '#QGL8JO',
	category: 'Game',
	aliases: ['club'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [],
	async execute({ message, args }) {
		let members = 0;
		let president;
		const bestPlayers = [];
		if (!args[0]) {
			return message.channel.send(
				'Please provide a tag!'
			);
		}

		const res = await fetch(`https://api.brawlstars.com/v1/clubs/${encodeURIComponent(args[0])}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${bsToken}`
			}
		});
		const status = await res.status;
		const json = await res.json();
		if (status === 404) {
			return message.channel.send(
				'Please provide a valid tag!'
			);
		} else if (status === 503) {
			return message.channel.send(
				'**Brawl Stars** is in maintenance, please try again later!'
			);
		}
		const embed = new MessageEmbed();
		json.members.forEach(m => {
			members += 1;
			bestPlayers.push({ name: m.name, trophies: m.trophies });
			if (m.role === 'president') {
				president = m.name;
			}
		});
		embed
			.setColor(global.config.color)
			.setTitle(`${json.name} | ${json.tag}`)
			.setURL(
				`https://brawlstats.com/club/${encodeURIComponent(
					args[0].replace('#', '')
				)}`
			)
			.setThumbnail(
				'https://cdn.discordapp.com/attachments/724146808598560789/758032896245235812/original.webp'
			)
			.setDescription(
				stripIndents`
					**[TH2](https://discord.gg/dusNMvr7ur)**

					**Description**
					\`\`\`${json.description}\`\`\`

					**President**
					\`${president}\`

					**Total Trophies**
					\`${json.trophies}\`

					**Average Trophies**
					\`${(json.trophies / members).toFixed(0)}\`

					**Required Trophies**
					\`${json.requiredTrophies}\`

					**Type**
					\`${json.type.charAt(0).toUpperCase() + json.type.slice(1)}\`

					**Members**
					\`${members}/100\`
					
					`
			)
			.addFields([
				{ name: '\u200B', value: '\u200B' },
				{
					name: 'Best Players',
					value: bestPlayers
						.slice(0, 5)
						.map(e => `\`${e.trophies} | ${e.name}\``)
				}
			]);
		return message.channel.send({ embed });
	}
};
