const { MessageEmbed } = require('discord.js');
const { Client } = require('clashofclans.js');
const { cocToken } = require('../../config.json');
const { stripIndents } = require('common-tags');
const paginate = require('../../utils/paginate');
const { Permissions } = require('discord.js');
const coc = new Client({
	token: cocToken
});

module.exports = {
	name: 'coc-warlog',
	description: 'Displays the war log for your Clash of Clans clan',
	usage: '<clanTag>',
	example: '#123423434',
	category: 'Game',
	aliases: ['wl', 'warlog'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [],
	async execute({ message, args }) {
		const tag = args[0];
		if (!tag) return message.channel.send('Please provide a tag!');
		const data = await coc.clanWarLog(tag, { limit: 10 }).catch(err => {
			console.log(err);
			return { ok: false, status: err.code, name: err.message };
		});
		if (data.status === 503) {
			return message.channel.send('**Clash of Clans** API is down!');
		}
		if (!data.ok && (data.status !== 404 || data.status !== 403)) {
			return message.channel.send(`${data.reason}`);
		}
		if (data.status === 404) {
			const WrongData = new MessageEmbed()
				.setDescription('Please provide a valid Clash of Clans tag')
				.setColor(global.config.color);
			return message.channel.send(WrongData);
		} else if (data.status === 403) {
			const WrongData = new MessageEmbed()
				.setDescription('This clan\'s war log is private!')
				.setColor(global.config.color);
			return message.channel.send(WrongData);
		}

		let str = '';
		let str2 = '';
		for (const items of data.items.slice(0, 5)) {
			str += stripIndents`
			------ ⚔️ **Result - ${String(items.result).replace(/null/g, 'Clan War League')}** ⚔️ ------
			    **Stars:** ${items.clan.stars} / ${items.opponent.stars}
				**Destruction:** ${items.clan.destructionPercentage.toFixed(2)}% / ${items.opponent.destructionPercentage.toFixed(2)}%
				⚔️ **Attacks:** ${items.clan.attacks}
				**Team Size:** ${items.teamSize}
				\n------\n\n
			`;
		}
		for (const items of data.items.slice(5, 10)) {
			str2 += stripIndents`
			------ ⚔️ **Result - ${String(items.result).replace(/null/g, 'Clan War League')}** ⚔️ ------
			    **Stars:** ${items.clan.stars} / ${items.opponent.stars}
				**Destruction:** ${items.clan.destructionPercentage.toFixed(2)}% / ${items.opponent.destructionPercentage.toFixed(2)}%
				⚔️ **Attacks:** ${items.clan.attacks}
				**Team Size:** ${items.teamSize}
				\n------\n\n
			`;
		}
		const embed = new MessageEmbed()
			.setColor(global.config.color)
			.setAuthor(`${data.items[0].clan.name} - ${data.items[0].clan.tag}`, data.items[0].clan.badgeUrls.small)
			.setThumbnail('https://cdn.discordapp.com/attachments/717460150528639077/751713217096712213/unnamed.png')
			.setDescription(str);

		const embed2 = new MessageEmbed()
			.setColor(global.config.color)
			.setAuthor(`${data.items[0].clan.name} - ${data.items[0].clan.tag}`, data.items[0].clan.badgeUrls.small)
			.setThumbnail('https://cdn.discordapp.com/attachments/717460150528639077/751713217096712213/unnamed.png')
			.setDescription(str2);

		return paginate(message, [embed, embed2]);
	}
};
