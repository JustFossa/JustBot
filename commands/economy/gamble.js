const economyUser = require('../../models/economy');
const { Permissions } = require('discord.js');
const emojis = require('../emojis/emojis');
const ms = require('ms');

const COOLDOWN = 1 * 60 * 60 * 1000;

const randomNum = (max, min) => Math.floor(Math.random() * (max - (min ? min : 0))) + (min ? min : 0);
const addMoney = async (userID, cash = 0) => {
	await economyUser.updateOne(
		{ userID },
		{ $set: { userID, 'cooldowns.GAMBLE': Date.now() + COOLDOWN }, $inc: { cash } },
		{ upsert: true }
	);
};

module.exports = {
	name: 'gamble',
	description: 'Take a risk and gamble a maximum of 5000 coins every 24 hours',
	usage: '<amount>',
	example: '1000',
	category: 'Economy',
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [],

	async execute({ message, args, settings, client, prefix }) {
		if (!settings.economyChannelID) return message.channel.send(`You must setup an economy channel in order to use this command!\n\n\`\`\`${prefix}seteconomy <mentionChannel>\`\`\``, { embed: null });
		if (settings.economyChannelID && message.channel.id !== settings.economyChannelID) return message.channel.send(`<:Aeo_cross:809875437470875739> You may only use this command in <#${settings.economyChannelID}>`, { embed: null });

		const user = await economyUser.findOne({ userID: message.author.id });
		if (user?.cooldowns?.GAMBLE > Date.now()) {
			return message.channel.send(`You must wait **${ms(user.cooldowns.GAMBLE - Date.now())}**`);
		}

		const msg = await message.channel.send(client.embed('How much money do you want to gamble?'));
		const awaited = await message.channel.awaitMessages(
			msg => msg.author.id === message.author.id,
			{ max: 1, time: 60000, errors: ['time'] }
		).catch(() => null);

		if (!awaited) {
			return msg.edit(`${emojis.cross} The command timed-out, please type the command to try again!`, { embed: null });
		}

		const m = awaited?.first();
		await m?.delete().catch(() => null);
		if (m?.content?.toLowerCase() === 'stop') {
			return msg.edit(`${emojis.tick} Command successfully terminated!`, { embed: null });
		}

		if (!user?.cash === 0) return msg.edit('You do not have any cash!', { embed: null });

		const amount = Number(m.content) || 0;
		const money = user && user.balance ? user.balance : 0;

		if (amount < 1) return msg.edit('You cant gamble less than 1!', { embed: null });
		if (amount > 5000) return msg.edit('You cant bet more than 5000!', { embed: null });
		if (amount > money) return msg.edit(`Missing cash:${args[0]}/${money}`, { embed: null });

		const win = randomNum(10, 1) > 4 ? true : false;
		const earning = win ? amount : -amount;
		await addMoney(message.author.id, earning);

		if (win) {
			return msg.edit(`You won **${amount}**!`, { embed: null });
		}
		return msg.edit(`You lost **${amount}**!`, { embed: null });
	}
};
