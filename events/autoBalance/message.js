const economyUser = require('../../models/economy');
const users = new Map();

const randomNum = (max = 5, min = 2) => Math.floor(Math.random() * (max - (min ? min : 0))) + (min ? min : 0);

const addMoney = async (userID, balance = 0) => economyUser.updateOne({ userID }, { $set: { userID }, $inc: { balance } }, { upsert: true });

// Disabled
module.exports = async (client, message) => {
	// if (message.author.bot) return;
	// if (users.has(message.author.id)) return;

	// users.set(message.author.id, setTimeout(() => users.delete(message.author.id), 1 * 60 * 1000));

	// return addMoney(message.author.id, randomNum(5, 2));
};

