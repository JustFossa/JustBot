const economyUser = require('../../models/economy');
const { Permissions } = require('discord.js');
const emojis = require('../emojis/emojis');

const addMoney = async (userID, num = 0) => {
	await economyUser.updateOne(
		{ userID },
		{ $set: { userID }, $inc: { balance: -num, cash: Number(num) } },
		{ upsert: true }
	);
};

module.exports = {
	name: 'withdraw',
	description: 'Withdraw money from your bank',
	usage: '<amount>',
	example: '10000',
	category: 'Economy',
	aliases: ['wd'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [],

	async execute({ message, prefix, settings, client }) {
		const msg = await message.channel.send(client.embed('How much money would you like to withdraw?'));
		const awaited = await message.channel.awaitMessages(
			msg => msg.author.id === message.author.id,
			{ max: 1, time: 60000, errors: ['time'] }
		).catch(() => null);

		if (!awaited) {
			return msg.edit(`${emojis.cross} The command timed-out, please type the command to try again!`, { embed: null });
		}

		const m = awaited?.first();

		if (m?.content?.toLowerCase() === 'stop') {
			await m.delete();
			return msg.edit(`${emojis.tick} Command successfully terminated!`, { embed: null });
		}

		if (m.content.toLowerCase() === 'all') {
			const user = await economyUser.findOne({ userID: message.author.id });
			if (!settings.economyChannelID) return message.channel.send(`You must setup an economy channel in order to use this command!\n\n\`\`\`${prefix}seteconomy <mentionChannel>\`\`\``, { embed: null });
			if (user && user.balance && user.balance > 0) {
				await addMoney(message.author.id, user.balance);
				return msg.edit(`Successfully withdrawn **${user.balance}** from the bank!`, { embed: null });
			}

			await m.delete();
			return msg.edit('You do not have any balance!', { embed: null });
		}

		const user = await economyUser.findOne({ userID: message.author.id });
		if (!settings.economyChannelID) return message.channel.send(`You must setup an economy channel in order to use this command!\n\n\`\`\`${prefix}seteconomy <mentionChannel>\`\`\``, { embed: null });
		if (user && user.balance && user.balance > 0) {
			const num = Number(m.content) || 0;
			if (num > user.balance) return msg.edit('You do not have enough balance to withdraw!', { embed: null });

			await addMoney(message.author.id, num);
			return msg.edit(`Successfully withdrawn **${num}** from the bank!`, { embed: null });
		}

		await m.delete();
		return msg.edit('You do not have any balance!', { embed: null });
	}
};
