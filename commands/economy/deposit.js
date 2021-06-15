const economyUser = require('../../models/economy');
const { Permissions } = require('discord.js');
const emojis = require('../emojis/emojis');

const addMoney = async (userID, num = 0) => {
	await economyUser.updateOne({ userID }, { $set: { userID }, $inc: { balance: Number(num), cash: -num } }, { upsert: true });
};

module.exports = {
	name: 'deposit',
	description: 'Deposit money into your bank',
	usage: '<amount>',
	example: '500',
	category: 'Economy',
	aliases: ['depo', 'dep'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [],
	async execute({ message, settings, client, prefix }) {
		if (!settings.economyChannelID) return message.channel.send(`You must setup an economy channel in order to use this command!\n\n\`\`\`${prefix}seteconomy <mentionChannel>\`\`\``, { embed: null });

		const msg = await message.channel.send(client.embed('How much money do you want deposited?'));
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

		const amount = Number(m.content);
		const user = await economyUser.findOne({ userID: message.author.id });
		if (user && user.cash && user.cash > 0) {
			const num = typeof amount === 'number' && amount > 0 && amount <= user.cash
				? amount
				: user.cash;
			await addMoney(message.author.id, num);

			return msg.edit(`Deposited **${num}** cash!`, { embed: null });
		}

		return msg.edit('You do not have any cash!', { embed: null });
	}
};
