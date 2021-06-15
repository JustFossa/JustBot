const economyUser = require('../../models/economy');
const { Permissions } = require('discord.js');
const ms = require('ms');

const COOLDOWN = 30 * 24 * 60 * 60 * 1000;

const randomNum = (max, min) => Math.floor(Math.random() * (max - (min ? min : 0))) + (min ? min : 0);
const addMoney = async (userID, cash = 0) => {
	await economyUser.updateOne(
		{ userID },
		{ $set: { userID, 'cooldowns.MONTHLY': Date.now() + COOLDOWN }, $inc: { cash } },
		{ upsert: true }
	);
};

module.exports = {
	name: 'monthly',
	description: 'Collect a reward every 24 days',
	usage: '',
	example: '',
	category: 'Economy',
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [],

	async execute({ message, settings, prefix }) {
		if (!settings.economyChannelID) return message.channel.send(`You must setup an economy channel in order to use this command!\n\n\`\`\`${prefix}seteconomy <mentionChannel>\`\`\``, { embed: null });
		if (settings.economyChannelID && message.channel.id !== settings.economyChannelID) return message.channel.send(`You may only use this command in <#${settings.economyChannelID}>`);

		const data = await economyUser.findOne({ userID: message.author.id });
		if (data?.cooldowns?.MONTHLY > Date.now()) {
			return message.channel.send(`You must wait **${ms(data.cooldowns.MONTHLY - Date.now())}**`);
		}

		const earning = randomNum(2000, 1500);
		await addMoney(message.author.id, earning);
		return message.channel.send(`You just collected **${earning}**!`);
	}
};
