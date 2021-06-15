const economyUser = require('../../models/economy');
const { Permissions } = require('discord.js');
const emojis = require('../emojis/emojis');
const ms = require('ms');

const COOLDOWN = 1 * 24 * 60 * 60 * 1000;

const addMoney = async (userID, cash = 0) => {
	await economyUser.updateOne(
		{ userID },
		{ $set: { userID, 'cooldowns.TRANSFER': Date.now() + COOLDOWN }, $inc: { cash } },
		{ upsert: true }
	);
};

module.exports = {
	name: 'transfer',
	description: 'Transfer money to another discord user',
	usage: '<user> <amount>',
	example: '@Xenfo#0001 400',
	category: 'Economy',
	aliases: ['donate'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [],
	async execute({ message, settings, client, prefix }) {
		if (!settings.economyChannelID) return message.channel.send(`You must setup an economy channel in order to use this command!\n\n\`\`\`${prefix}seteconomy <mentionChannel>\`\`\``, { embed: null });
		if (settings.economyChannelID && message.channel.id !== settings.economyChannelID) return message.channel.send(`You may only use this command in <#${settings.economyChannelID}>`);

		const user = await economyUser.findOne({ userID: message.author.id });
		if (user?.cooldowns?.TRANSFER > Date.now()) {
			return message.channel.send(`You must wait **${ms(user.cooldowns.TRANSFER - Date.now())}**`);
		}
		const bal = user ? user.cash : 0;

		const msg = await message.channel.send(client.embed('Who would you like to transfer money to?'));
		const awaited = await message.channel.awaitMessages(
			msg => msg.author.id === message.author.id,
			{ max: 1, time: 60000, errors: ['time'] }
		).catch(() => null);

		if (!awaited) {
			return msg.edit(`${emojis.cross} The command timed-out, please type the command to try again!`, { embed: null });
		}

		const m = awaited?.first();
		await m.delete();
		if (m?.content?.toLowerCase() === 'stop') {
			return msg.edit(`${emojis.tick} Command successfully terminated!`, { embed: null });
		}

		await msg.edit(client.embed('How much money would you like to give?'));
		const res = await message.channel.awaitMessages(
			msg => msg.author.id === message.author.id,
			{ max: 1, time: 30000, errors: ['time'] }
		).catch(() => null);

		if (!res) {
			return msg.edit(`${emojis.cross} The command timed-out, please type the command to try again!`, { embed: null });
		}

		const mText = res.first();
		await mText?.delete().catch(() => null);
		if (mText?.content?.toLowerCase() === 'stop') {
			return msg.edit(`${emojis.tick} Command successfully terminated!`, { embed: null });
		}

		const member = message.guild.member(m.mentions.users.first() || m.content);
		if (!member) return msg.edit('You must mention someone', { embed: null });
		if (mText.content > 5000) return msg.edit('You can\'t transfer more than **5000**', { embed: null });
		if (Number(mText.content) < 1 || isNaN(mText.content)) return msg.edit('You can\'t transfer less than <:Aeo:711668923485126757>**1**', { embed: null });
		if (Number(mText.content) > bal) return msg.edit('You don\'t have that much money to give to anyone!', { embed: null });

		const deduct = Number(mText.content) || 0;
		await addMoney(message.author.id, -deduct);
		await addMoney(member.id, deduct);
		return msg.edit(`You gave **${mText.content}** to **${member.user.username}**`, { embed: null });
	}
};
