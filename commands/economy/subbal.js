const economyUser = require('../../models/economy');
const { Permissions } = require('discord.js');

const addMoney = async (userID, balance = 0) => {
	await economyUser.updateOne({ userID }, { $set: { userID }, $inc: { balance: -balance } }, { upsert: true });
};

module.exports = {
	name: 'subbal',
	description: 'Remove money from someones account',
	usage: '<user> <amount>',
	example: '@Xenfo#0001 10000',
	aliases: ['subtract-balance', 'sub'],
	category: 'Owner Only',

	async execute({ message, args, client }) {
		if (!Object.values(global.config.owners).includes(message.author.id)) {
			return;
		}

		const user = message.mentions.users.first() || client.users.cache.get(args[0]);
		if (!user) return message.channel.temp('You must mention someone');
		await message.delete().catch(() => null);

		const bal = Number(args[1]) || 0;
		await addMoney(user.id, bal);
		return message.channel.temp(`Removed **${bal}** from **${user.tag}'s** balance!`);
	}
};
