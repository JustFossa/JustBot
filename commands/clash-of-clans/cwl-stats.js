/* eslint-disable no-shadow */
const { MessageEmbed } = require('discord.js');
const { Permissions } = require('discord.js');
const { cocToken } = require('../../config.json');
const { Client } = require('clashofclans.js');
const moment = require('moment');

const coc = new Client({
	token: cocToken
});

async function round(message, body, clan) {
	const clanTag = clan.tag;
	const rounds = body.rounds.filter(d => !d.warTags.includes('#0'));
	const chunks = [];
	let index = 0;
	for (const { warTags } of rounds) {
		for (const warTag of warTags) {
			const data = await coc.clanWarLeagueWarTags(warTag);
			if (data.status === 503) {
				return message.channel.send('**Clash of Clans** API is down!');
			}
			if ((data.clan && data.clan.tag === clanTag) || (data.opponent && data.opponent.tag === clanTag)) {
				const clan = data.clan.tag === clanTag ? data.clan : data.opponent;
				const opponent = data.clan.tag === clan.tag ? data.opponent : data.clan;
				const embed = new MessageEmbed()
					.setColor(global.config.color)
					.setThumbnail('https://cdn.discordapp.com/attachments/717460150528639077/751713217096712213/unnamed.png');
				embed.setAuthor(`${clan.name} - ${clan.tag}`, clan.badgeUrls.medium);
				if (data.state === 'warEnded') {
					const end = new Date(moment(data.endTime).toDate()).getTime();
					embed.setDescription([
						'<:sword:721759208613216297> War against:',
						`\`\u200e${opponent.name} - ${opponent.tag}\``,
						'',
						'<:game:717436930618425344> War State:',
						'`War Ended`',
						'',
						'War Stats:',
						`• ${clan.stars} - ${opponent.stars}`,
						`• ${clan.destructionPercentage.toFixed(2)} - ${opponent.destructionPercentage.toFixed(2)}`,
						`• ${clan.attacks} - ${opponent.attacks}`,
						'',
						'War Size:',
						`\`${data.teamSize}\``,
						'',
						'Ended:',
						`\`${moment.duration(Date.now() - end).format('D[d] H[h] m[m]', { trim: 'both mid' })} ago\``
					]);
				}
				if (data.state === 'inWar') {
					const end = new Date(moment(data.endTime).toDate()).getTime();
					embed.setDescription([
						'<:sword:721759208613216297> War against:',
						`\`\u200e${opponent.name} - ${opponent.tag}\``,
						'',
						'War State:',
						'`Battle Day`',
						'',
						'War Stats:',
						`• ${clan.stars} - ${opponent.stars}`,
						`• ${clan.destructionPercentage.toFixed(2)} - ${opponent.destructionPercentage.toFixed(2)}`,
						`• ${clan.attacks} - ${opponent.attacks}`,
						'',
						'War Size:',
						`\`${data.teamSize}\``,
						'',
						'Ended:',
						`\`${moment.duration(end - Date.now()).format('D[d] H[h] m[m]', { trim: 'both mid' })}\``
					]);
				}
				if (data.state === 'preparation') {
					const start = new Date(moment(data.startTime).toDate()).getTime();
					embed.setDescription([
						'War against:',
						`\`\u200e${opponent.name} - ${opponent.tag}\``,
						'',
						'War State:',
						'`Preparation Day`',
						'',
						'War Size:',
						`\`${data.teamSize}\``,
						'',
						'Ends in:',
						`\`${moment.duration(start - Date.now()).format('D[d] H[h] m[m]', { trim: 'both mid' })}\``
					]);
				}
				embed.setFooter(`Round #${++index}`);
				chunks.push({ state: data.state, embed });
				break;
			}
		}
	}

	const item = chunks.length === 7
		? chunks.find(c => c.state === 'inWar') || chunks.slice(-1)[0]
		: chunks.slice(-2)[0];
	return message.channel.send({ embed: item.embed });
}

module.exports = {
	name: 'cwl-stats',
	description: 'Provides CWL stats for your Clash of Clans command',
	usage: '<clanTag>',
	example: '#222CVLVVU',
	category: 'Game',
	aliases: [],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [],
	args: true,
	async execute({ message, args }) {
		const tag = args[0];
		if (!tag) return message.channel.send('Please provide a tag!');
		const clan = await coc.clan(args[0]);

		if (!clan.ok) {
			return message.channel.send('Please say a valid tag');
		}

		const data = await coc.clanWarLeague(tag);

		if (!data.ok) {
			return message.channel.send('This clan is not in CWL');
		}

		return round(message, data, clan);
	}
};
