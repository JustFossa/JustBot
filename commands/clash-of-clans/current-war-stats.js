const { MessageEmbed } = require('discord.js');
const { Permissions } = require('discord.js');
const { cocToken } = require('../../config.json');
const { Client } = require('clashofclans.js');
const moment = require('moment');
const { stripIndents } = require('common-tags');
const coc = new Client({
	token: cocToken
});

module.exports = {
	name: 'coc-war-stats',
	description: 'Provides information about current war stats for your Clash of Clans clan',
	usage: '<clanTag>',
	example: '#222CVLVVU',
	category: 'Game',
	aliases: ['war'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [],
	async execute({ message, args }) {
		const tag = args[0];
		if (!tag) return message.channel.send('Please provide a tag!');
		const data = await coc.clan(tag);
		const clan = await coc.currentClanWar(tag);

		if (data.status === 404) {
			const WrongData = new MessageEmbed()
				.setDescription('Please provide a valid Clash of Clans tag')
				.setColor(global.config.color);
			return message.channel.send(WrongData);
		} else if (data.status === 503) {
			return message.channel.send('**Clash of Clans** API is down!');
		} else if (clan.status === 403) {
			const WrongData = new MessageEmbed()
				.setDescription('This clan\'s war log is private!')
				.setColor(global.config.color);
			return message.channel.send(WrongData);
		}

		if (!data.ok) {
			return message.channel.send(`${data.reason}`);
		} else if (clan.state === 'notInWar') {
			const WrongData = new MessageEmbed()
				.setDescription('This clan is not in a war!')
				.setColor(global.config.color);
			return message.channel.send(WrongData);
		} else if (clan.state === 'inWar') {
			const time1 = moment(clan.endTime).toDate();
			const time2 = new Date();
			const time = moment.duration(time1 - time2).format('D [days] h [hours] m [mins]');
			const embed = new MessageEmbed()
				.setColor(global.config.color)
				.setThumbnail('https://cdn.discordapp.com/attachments/717460150528639077/751713217096712213/unnamed.png')

				.setDescription(stripIndents`
				War State:
				\`Battle Day\`

				War Size:
				\`${clan.clan.members.length} v ${clan.opponent.members.length}\`

				War Stars:
				\`${clan.clan.stars} - ${clan.opponent.stars}\`

				Destruction:
				\`${clan.clan.destructionPercentage.toFixed(2)} - ${clan.opponent.destructionPercentage.toFixed(2)}\`

				Attacks:
				\`${clan.clan.attacks} - ${clan.opponent.attacks}\`

				Ends In:
				\`${time}\`

				War against:
				\`${clan.opponent.name} - ${clan.opponent.tag}\`
				`)
				.setAuthor(`${data.name} - ${data.tag}`, data.badgeUrls.small);

			return message.channel.send({ embed });
		} else if (clan.state === 'preparation') {
			const time1 = moment(clan.startTime).toDate();
			const time2 = new Date();
			const time = moment.duration(time1 - time2).format('D [days] h [hours] m [mins]');
			const embed = new MessageEmbed()
				.setColor(global.config.color)
				.setThumbnail('https://cdn.discordapp.com/attachments/717460150528639077/751713217096712213/unnamed.png')

				.setDescription(stripIndents`
				**War against:**
				\`${clan.opponent.name} - ${clan.opponent.tag}\`

				War State:
				\`Preparation Day\`

				Members:
				\`${clan.clan.members.length} v ${clan.opponent.members.length}\`

				Starts in:
				\`${time}\`
				`)
				.setAuthor(`${data.name} - ${data.tag}`, data.badgeUrls.small);

			return message.channel.send({ embed });
		} else if (clan.state === 'warEnded') {
			const time1 = moment(clan.endTime).toDate();
			const time2 = new Date();
			const time = moment.duration(time2 - time1).format('D [days] h [hours] m [mins]');

			const embed = new MessageEmbed()
				.setColor(global.config.color)
				.setThumbnail('https://cdn.discordapp.com/attachments/717460150528639077/751713217096712213/unnamed.png')

				.setDescription(stripIndents`
				War against:
				${clan.opponent.name} ${clan.opponent.tag}

				War State
				War Ended

				War Stats
				• Opponent Stars: ${clan.clan.stars} - ${clan.opponent.stars}
				• %: ${clan.clan.destructionPercentage.toFixed(2)} - ${clan.opponent.destructionPercentage.toFixed(2)}
				• Attacks: ${clan.clan.attacks} - ${clan.opponent.attacks}

				War Size:
				\`${clan.clan.members.length} v ${clan.opponent.members.length}\`

				Ended
				\`${time} ago\`
				`)
				.setAuthor(`${data.name} - ${data.tag}`, data.badgeUrls.small);
			return message.channel.send(embed);
		}
	}

};
