const { MessageEmbed } = require('discord.js');
const { Client } = require('../../utils/clashroyale/index');
const { clashroyaletoken } = require('../../config.json');
const paginate = require('../../utils/paginate');
const { Permissions } = require('discord.js');
const coc = new Client({ token: clashroyaletoken });

module.exports = {
	name: 'cr-clan-members',
	description: 'Provides a list of your Clash Royale clan members',
	usage: '<clanTag>',
	example: '#YLQ9UUOG',
	category: 'Game',
	aliases: ['crm', 'crmembers'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [],
	async execute({ message, args }) {
		const tag = args[0];
		if (!tag) return message.channel.send('Please provide a tag!');
		const data = await coc.clan(tag).catch(err => {
			console.log(err);
			return { ok: false, status: err.code, name: err.message };
		});

		if (!data.ok) {
			return message.channel.send(`${data.reason}`);
		}
		let count = 0;
		const members1 = data.memberList.slice(0, 25);
		const members2 = data.memberList.slice(25, 50);

		const embed = new MessageEmbed()
			.setAuthor(`${data.name} `)
			.setColor(global.config.color)
			.setThumbnail('https://cdn.discordapp.com/avatars/704725852453208104/f865e9817d5f675a2abd3cc9de6178d3.png?size=2048')
			.setDescription(members1.map(m => `\`${++count}\` ${m.name} ${m.tag}`).join('\n'));

		const embed2 = new MessageEmbed()
			.setAuthor(`${data.name} `)
			.setColor(global.config.color)
			.setThumbnail('https://cdn.discordapp.com/avatars/704725852453208104/f865e9817d5f675a2abd3cc9de6178d3.png?size=2048')
			.setDescription(members2.map(m => `\`${++count}\` ${m.name} ${m.tag}`).join('\n'));

		if (!members2.length) {
			return message.channel.send({ embed });
		}

		const pages = [embed, embed2];
		paginate(message, pages);
	}
};

