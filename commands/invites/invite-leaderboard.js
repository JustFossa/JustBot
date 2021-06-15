
/*const arraySort = require('array-sort');
const Discord = require('discord.js');
const paginate = require('../../utils/paginate');
const { Permissions } = require('discord.js');

module.exports = {
	name: 'invite-leaderboard',
	description: 'Displays a leaderboard of the total invites per user',
	usage: '',
	example: '',
	category: 'Utility',
	aliases: ['ilb'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.ADD_REACTIONS, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [],
	async execute({ message, args, utils: { settings: settingsManager } }) {
		let invites = await message.guild.fetchInvites().catch(e => message.channel.temp('<:Aeo_cross:809875437470875739> I do not have enough permissions to view invites!'));

		invites = invites.array();
		const inviters = [];
		invites.forEach(invite => {
			if (invite.inviter !== null) {
				if (!inviters.includes(invite.inviter.username)) inviters.push(invite.inviter.username);
			}
		});

		const posibleInvites = [];
		let count = 0;

		for (let i = 0; i < inviters.length; i++) {
			invites.forEach(invite => {
				if (invite.inviter !== null) {
					if (inviters[i] === invite.inviter.username) count += invite.uses;
				}
			});
			posibleInvites.push([inviters[i], count]);
			count = 0;
		}

		posibleInvites.sort((a, b) => b[1] - a[1]);

		let result1 = '';
		let result2 = '';
		let result3 = '';
		let result4 = '';
		for (let i = 0; i < posibleInvites.length; i++) {
			if (i < 15) result1 += `${i + 1}. ${posibleInvites[i][0]} - ${posibleInvites[i][1]}\n`;
			else if (i > 14 && i < 30) result2 += `${i + 1}. ${posibleInvites[i][0]} - ${posibleInvites[i][1]}\n`;
			else if (i > 29 && i < 45) result3 += `${i + 1}. ${posibleInvites[i][0]} - ${posibleInvites[i][1]}\n`;
			else if (i > 44 && i < 60) result4 += `${i + 1}. ${posibleInvites[i][0]} - ${posibleInvites[i][1]}\n`;
		}


		let embed1;
		let embed2;
		let embed3;
		let embed4;
		if (result1 !== '') {
			embed1 = new Discord.MessageEmbed()
				.setTitle('<:invite:717436253871538318> Invite Leaderboard')
				.setDescription(result1)
				.setColor(global.config.color)
				.setThumbnail(message.guild.iconURL({ dynamic: true, format: 'png' }));
		}

		if (result2 !== '') {
			embed2 = new Discord.MessageEmbed()
				.setTitle('<:invite:717436253871538318> Invite Leaderboard')
				.setDescription(result2)
				.setColor(global.config.color)
				.setThumbnail(message.guild.iconURL({ dynamic: true, format: 'png' }));
		}

		if (result3 !== '') {
			embed3 = new Discord.MessageEmbed()
				.setTitle('<:invite:717436253871538318> Invite Leaderboard')
				.setDescription(result3)
				.setColor(global.config.color)
				.setThumbnail(message.guild.iconURL({ dynamic: true, format: 'png' }));
		}

		if (result4 !== '') {
			embed4 = new Discord.MessageEmbed()
				.setTitle('<:invite:717436253871538318> Invite Leaderboard')
				.setDescription(result4)
				.setColor(global.config.color)
				.setThumbnail(message.guild.iconURL({ dynamic: true, format: 'png' }));
		}

		let pages;
		if (embed2 === undefined && embed3 === undefined && embed4 === undefined) return message.channel.send(embed1);
		if (embed3 === undefined && embed4 === undefined) pages = [embed1, embed2];
		if (embed4 === undefined) pages = [embed1, embed2, embed3];
		else pages = [embed1, embed2, embed3, embed4];

		await paginate(message, pages);
	}
};*/
