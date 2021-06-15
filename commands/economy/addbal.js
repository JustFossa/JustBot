const economyUser = require('../../models/economy');

const addMoney = async (userID, balance = 0) => {
	await economyUser.updateOne({ userID }, { $set: { userID }, $inc: { balance } }, { upsert: true });
};

module.exports = {
	name: 'addbal',
	description: 'Add money to a user, a bot administrator only command.',
	usage: '<mentionUser> <amount>',
	example: '@Koni#0001 10000',
	aliases: ['add-balance', 'addbalance', 'add'],
	category: 'Owner Only',
	ownerOnly: true,

	async execute({ message, args, client }) {
		if (!Object.values(global.config.owners).includes(message.author.id)) {
			return;
		}

		const member = message.mentions.users.first() || client.users.cache.get(args[0]);
		if (!member) return message.channel.temp('You must mention someone');

		const bal = Number(args[1]) || 0;
		await addMoney(member.id, bal);
		return message.channel.send(`Added **${bal}** to **${member.username}'s** balance!`);
	}
};
