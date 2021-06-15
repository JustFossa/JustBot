const { MessageEmbed } = require('discord.js');
const { Permissions } = require('discord.js');
const { cocToken } = require('../../config.json');
const { Client } = require('clashofclans.js');
const Townhalls = require('../emojis/townahalls');

const coc = new Client({
	token: cocToken
});

module.exports = {
	name: 'cwl-roster',
	description: 'Provides the CWL roster for Clash of Clans',
	usage: '<clanTag>',
	example: '#222CVLVVU',
	aliases: ['roster'],
	category: 'Game',
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [],
	args: true,
	async execute({ message, args }) {
		const tag = args[0];
		if (!tag) return message.channel.send('Please provide a tag!');
		const data = await coc.clanWarLeague(tag);

		if (data.status === 503) {
			return message.channel.send('**Clash of Clans** API is down!');
		}
		if (!data.ok) {
			return message.channel.send('This clan is not in CWL!');
		}

		const embed = new MessageEmbed();
		embed.setColor(global.config.color);
		embed.setAuthor('CWL Roster');
		embed.setDescription('CWL Roster and Town-Hall Distribution');

		let index = 0;
		for (const clan of data.clans) {
			const reduced = clan.members.reduce((count, member) => {
				const townHall = member.townHallLevel;
				count[townHall] = (count[townHall] || 0) + 1;
				return count;
			}, {});

			const townHalls = Object.entries(reduced)
				.map(entry => ({ level: entry[0], total: entry[1] }))
				.sort((a, b) => b.level - a.level);

			embed.addField(`${++index}. ${clan.tag === data.tag ? `**${clan.name} (${clan.tag})**` : `${clan.name} (${clan.tag})`}`, [
				townHalls.map(th => `${Townhalls[th.level]} \u200e\`${th.total.toString().padStart(2, ' ')}\``).join(' ')
			]);
		}

		return message.channel.send({ embed });
	}
};
