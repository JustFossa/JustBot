const economyUser = require('../../models/economy');
const { Permissions } = require('discord.js');
const ms = require('ms');

const COOLDOWN = 60 * 60 * 1000

const randomNum = (max, min) => Math.floor(Math.random() * (max - (min ? min : 0))) + (min ? min : 0);
const addMoney = async (userID, cash = 0) => {
	await economyUser.updateOne(
		{ userID },
		{ $set: { userID, 'cooldowns.CRIME': Date.now() + COOLDOWN }, $inc: { cash } },
		{ upsert: true }
	);
};

module.exports = {
	name: 'crime',
	description: 'Take the risk and commit a crime',
	usage: '',
	example: '',
	category: 'Economy',
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [],

	async execute({ message, settings, prefix }) {
		if (!settings.economyChannelID) return message.channel.send(`You must setup an economy channel in order to use this command!\n\n\`\`\`${prefix}seteconomy <mentionChannel>\`\`\``, { embed: null });
		if (settings.economyChannelID && message.channel.id !== settings.economyChannelID) return message.channel.send(`You may only use this command in <#${settings.economyChannelID}>`);

		const data = await economyUser.findOne({ userID: message.author.id });
		if (data?.cooldowns?.CRIME > Date.now()) {
			return message.channel.send(`You must wait **${ms(data.cooldowns.CRIME - Date.now())}**`);
		}

		const win = randomNum(10, 1) > 4 ? false : true;
		const earning = win ? 250 : -250;
		await addMoney(message.author.id, earning);

		if (win) {
			return message.channel.send('You committed a crime and got **250**!');
		}
		return message.channel.send('You got caught and fined **250**!');
	}
};
