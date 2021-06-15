const { MessageEmbed } = require('discord.js');
const { Permissions } = require('discord.js');
const { cocToken } = require('../../config.json');
const { Client } = require('clashofclans.js');
const numbers = require('../emojis/numbers');
const coc = new Client({
	token: cocToken
});

function dest(dest, padding) {
	return dest.toFixed()
		.toString()
		.concat('%')
		.padEnd(padding, ' ');
}

function winner(clan, opponent) {
	if (clan.stars > opponent.stars) {
		return true;
	} else if (clan.stars < opponent.stars) {
		return false;
	}
	if (clan.destructionPercentage > opponent.destructionPercentage) {
		return true;
	} else if (clan.destructionPercentage < opponent.destructionPercentage) {
		return false;
	}
	return false;
}

async function round(message, body, clan) {
	const clanTag = clan.tag;
	const rounds = body.rounds.filter(r => !r.warTags.includes('#0'));
	let [stars, destruction, padding] = [0, 0, 5];
	const ranking = {};

	for (const { warTags } of rounds) {
		for (const warTag of warTags) {
			const data = await coc.clanWarLeagueWar(warTag);
			if (data.state === 'inWar') {
				const clan = ranking[data.clan.tag]
					? ranking[data.clan.tag]
					: ranking[data.clan.tag] = {
						tag: data.clan.tag,
						stars: 0
					};
				clan.stars += data.clan.stars;

				const opponent = ranking[data.opponent.tag]
					? ranking[data.opponent.tag]
					: ranking[data.opponent.tag] = {
						tag: data.opponent.tag,
						stars: 0
					};
				opponent.stars += data.opponent.stars;
			}

			if (data.state === 'warEnded') {
				const clan = ranking[data.clan.tag]
					? ranking[data.clan.tag]
					: ranking[data.clan.tag] = {
						name: data.clan.name,
						tag: data.clan.tag,
						stars: 0,
						destruction: 0
					};
				clan.stars += winner(data.clan, data.opponent)
					? data.clan.stars + 10
					: data.clan.stars;

				clan.destruction += data.clan.destructionPercentage * data.teamSize;

				const opponent = ranking[data.opponent.tag]
					? ranking[data.opponent.tag]
					: ranking[data.opponent.tag] = {
						tag: data.opponent.tag,
						name: data.opponent.name,
						stars: 0,
						destruction: 0
					};
				opponent.stars += winner(data.opponent, data.clan)
					? data.opponent.stars + 10
					: data.opponent.stars;

				opponent.destruction += data.opponent.destructionPercentage * data.teamSize;
			}

			if ((data.clan && data.clan.tag === clanTag) || (data.opponent && data.opponent.tag === clanTag)) {
				const clan = data.clan.tag === clanTag ? data.clan : data.opponent;
				const opponent = data.clan.tag === clanTag ? data.opponent : data.clan;
				if (data.state === 'warEnded') {
					stars += winner(clan, opponent) ? clan.stars + 10 : clan.stars;
					destruction += clan.destructionPercentage * data.teamSize;
				}
				if (data.state === 'inWar') {
					stars += clan.stars;
					destruction += clan.destructionPercentage * data.teamSize;
				}

				if (destruction > 9999) padding = 6;
			}
		}
	}

	const ranks = Object.values(ranking);
	const rank = ranks.sort((a, b) => b.stars - a.stars).findIndex(a => a.tag === clanTag);
	const embed = new MessageEmbed()
		.setColor(global.config.color)
		.setAuthor(`${clan.name} ${clan.tag}`, clan.badgeUrls.small)
		.setDescription([
			`CWL Leaderboard ${clan.name}`,
			'',
			`${''} **\`STAR DEST${''.padEnd(padding - 2, ' ')}${'NAME'.padEnd(15, ' ')}\`**`,
			ranks.sort((a, b) => b.stars - a.stars)
				.map((clan, i) => `${i === 0 ? '' : numbers[i + 1]} \`${clan.stars.toString().padEnd(3, ' ')}  ${dest(clan.destruction, padding)}  ${clan.name.padEnd(15, ' ')}\``)
				.join('\n')
		])
		.setFooter(`Rank ${rank + 1}, ${stars} Stars, ${destruction.toFixed()}% Destruction`);
	return message.channel.send({ embed });
}

module.exports = {
	name: 'cwl-leaderboard',
	description: 'Provides the current CWL leaderboard for Clash of Clans',
	usage: '<clanTag>',
	example: '#222CVLVVU',
	category: 'Game',
	aliases: ['cwl-ranks'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [],
	args: true,
	async execute({ message, args }) {
		const tag = args[0];
		if (!tag) return message.channel.send('Please provide a tag!');
		const clan = await coc.clan(args[0]);

		if (clan.status === 503) {
			return message.channel.send('**Clash of Clans** API is down!');
		}
		if (!clan.ok) {
			return message.channel.send(`${clan.reason || clan.message}`);
		}

		const data = await coc.clanWarLeague(tag);

		if (!data.ok) {
			return message.channel.send(`${data.reason || data.message}`);
		}

		return round(message, data, clan);
	}
};
