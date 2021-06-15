const { MessageEmbed } = require('discord.js');
const { Permissions } = require('discord.js');
const { Client } = require('clashofclans.js');
const { leagues } = require('../emojis/leagues.js');
const { cocToken } = require('../../config.json');
const paginate = require('../../utils/paginate');
const coc = new Client({
	token: cocToken
});

module.exports = {
	name: 'coc-clan-members',
	description: 'Provides a list of Clash of Clans players in your clan based on trophies',
	usage: '<clanTag>',
	example: '#222CVLVVU',
	category: 'Game',
	aliases: ['cm', 'clan-members'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [],
	async execute({ message, args }) {
		const tag = args[0];
		if (!tag) return message.channel.send('Please provide a tag!');
		const data = await coc.clan(tag).catch(err => {
			console.log(err);
			return { ok: false, status: err.code, name: err.message };
		});

		if (data.status === 503) {
			return message.channel.send('**Clash of Clans** is in maintenance, please try again later!');
		}

		if (!data.ok) {
			return message.channel.send(`${data.reason}`);
		}
		const members1 = data.memberList.slice(0, 25);
		const members2 = data.memberList.slice(25, 50);

		const embed = new MessageEmbed()
			.setAuthor(`${data.name} `)
			.setColor(global.config.color)
			.setThumbnail('https://cdn.discordapp.com/attachments/717460150528639077/751713217096712213/unnamed.png')
			.setDescription(members1.map(m => `${leagues[m.league.id]} ${m.name} ${m.tag}`).join('\n'));

		const embed2 = new MessageEmbed()
			.setAuthor(`${data.name} `)
			.setColor(global.config.color)
			.setThumbnail('https://cdn.discordapp.com/attachments/717460150528639077/751713217096712213/unnamed.png')
			.setDescription(members2.map(m => `${leagues[m.league.id]} ${m.name} ${m.tag}`).join('\n'));

		if (!members2.length) {
			return message.channel.send({ embed });
		}

		const pages = [embed, embed2];
		paginate(message, pages);
	}
};

