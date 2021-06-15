const economyUser = require('../../models/economy');
const { Permissions } = require('discord.js');
const ms = require('ms');

const COOLDOWN = 7 * 24 * 60 * 60 * 1000;

const randomNum = (max, min) => Math.floor(Math.random() * (max - (min ? min : 0))) + (min ? min : 0);
const addMoney = async (userID, cash = 0) => {
	await economyUser.updateOne(
		{ userID },
		{ $set: { userID, 'cooldowns.WEEKLY': Date.now() + COOLDOWN }, $inc: { cash } },
		{ upsert: true }
	);
};

module.exports = {
	name: 'weekly',
	description: 'Collect a reward every 7 days',
	usage: '',
	example: '',
	category: 'Economy',
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [],
	async execute({ message, settings, prefix }) {
		if (!settings.economyChannelID) return message.channel.send(`You must setup an economy channel in order to use this command!\n\n\`\`\`${prefix}seteconomy <mentionChannel>\`\`\``, { embed: null });
		if (settings.economyChannelID && message.channel.id !== settings.economyChannelID) return message.channel.send(`<You may only use this command in <#${settings.economyChannelID}>`);

		const data = await economyUser.findOne({ userID: message.author.id });
		if (data?.cooldowns?.WEEKLY > Date.now()) {
			return message.channel.send(`You must wait **${ms(data.cooldowns.WEEKLY - Date.now())}**`);
		}

		const earning = randomNum(800, 600);
		await addMoney(message.author.id, earning);
		return message.channel.send(`You just collected **${earning}**!`);
	}
};
