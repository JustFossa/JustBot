const { bsToken } = require('../../config.json');
const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');
const { Permissions } = require('discord.js');
module.exports = {
	name: 'brawl-stars-player',
	description: 'Provides information about a Brawl Stars Player',
	usage: '<playerTag>',
	example: '#89QG9UY',
	category: 'Game',
	aliases: ['bsp', 'bsplayer'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [],
	async execute({ message, args }) {
		let brawlers = 0;
		if (!args[0]) {
			return message.channel.send(
				'Please provide a tag!'
			);
		}

		const res = await fetch(`https://api.brawlstars.com/v1/players/${encodeURIComponent(args[0])}`, {
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
		json.brawlers.forEach(() => {
			brawlers += 1;
		});
		embed
			.setColor(global.config.color)
			.setTitle(`${json.name} | ${json.tag}`)
			.setURL(
				`https://brawlstats.com/profile/${encodeURIComponent(
					args[0].replace('#', '')
				)}`
			)
			.setThumbnail(
				'https://cdn.discordapp.com/attachments/724146808598560789/758032896245235812/original.webp'
			)
			.setDescription(stripIndents`
				    **[TH2](https://discord.gg/dusNMvr7ur)**

					**Club**
					\`${json.club.name ? `${json.club.name} | ${json.club.tag}` : 'None'}\`

					**Trophies**
					\`${json.trophies}\`

					**Highest Trophies**
					\`${json.highestTrophies}\`

					**Highest Power Play Points**
					\`${json.highestPowerPlayPoints}\`

					**Highest Robo Rumble Level Passed**
					\`${json.bestRoboRumbleTime}\`

					**3 vs 3 Victories**
					\`${json['3vs3Victories']}\`

					**Showdown Victories**
					\`Solo: ${json.soloVictories} | Duo: ${json.duoVictories}\`

					**Experience Level**
					\`${json.expLevel}\`

					**Brawlers Unlocked**
					\`${brawlers}\`
					
					
					
					`);
		return message.channel.send({ embed });
	}
};
