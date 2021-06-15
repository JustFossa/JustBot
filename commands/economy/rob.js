const economyUser = require('../../models/economy');
const { Permissions } = require('discord.js');
const emojis = require('../emojis/emojis');
const ms = require('ms');

const COOLDOWN = 24 * 60 * 60 * 1000;

const addMoney = async (userID, cash = 0) => economyUser.updateOne({ userID }, { $set: { userID }, $inc: { cash } }, { upsert: true });
const robMoney = async (userID, cash = 0) => {
	await economyUser.updateOne(
		{ userID },
		{ $set: { userID, 'cooldowns.ROB': Date.now() + COOLDOWN }, $inc: { cash: -cash } },
		{ upsert: true }
	);
};

module.exports = {
	name: 'rob-user',
	description: 'Rob someone elses current balance',
	usage: '<user> <amount>',
	example: '',
	category: 'Economy',
	aliases: ['rob', 'r'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [],

	async execute({ message, args, client }) {
		const msg = await message.channel.send(client.embed('Who would you like to rob?'));
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

		const member = m.mentions.users.first() || client.users.cache.get(m.content);
		if (!member) return msg.edit('You must mention someone!', { embed: null });

		const data = await economyUser.findOne({ userID: message.author.id });
		if (data?.cooldowns?.ROB > Date.now()) {
			return message.channel.send(`${message.author} You are on cooldown, you must wait: **${ms(data.cooldowns.ROB - Date.now())}**`);
		}

		const memberBank = await economyUser.findOne({ userID: member.id });
		const memberCash = memberBank && memberBank.cash ? memberBank.cash : 0;
		const robbed = Math.floor((memberCash * 40) / 100);

		if (robbed === 0) {
			return msg.edit('This user has **0** in cash!', { embed: null });
		}

		await robMoney(member.id, robbed);
		await addMoney(message.author.id, robbed);
		return msg.edit(`${message.author} Successfully robbed **${robbed}** from **${member.username}**`, { embed: null });
	}
};
