const jobs = ['House wife', 'Programmer', 'Builder', 'McDonald\'s employee', 'Law enforcer', 'Lawyer', 'Banker', 'Cleaner', 'Discord Mod'];
const economyUser = require('../../models/economy');
const { Permissions } = require('discord.js');
const ms = require('ms');

const COOLDOWN = 1 * 60 * 60 * 1000;

const randomNum = (max, min) => Math.floor(Math.random() * (max - (min ? min : 0))) + (min ? min : 0);
const addMoney = async (userID, cash = 0) => {
	await economyUser.updateOne(
		{ userID },
		{ $set: { userID, 'cooldowns.WORK': Date.now() + COOLDOWN }, $inc: { cash } },
		{ upsert: true }
	);
};

module.exports = {
	name: 'work',
	description: 'Work and make money',
	usage: '',
	example: '',
	category: 'Economy',
	aliases: [],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [],

	async execute({ message, settings, prefix }) {
		if (!settings.economyChannelID) return message.channel.send(`You must setup an economy channel in order to use this command!\n\n\`\`\`${prefix}seteconomy <mentionChannel>\`\`\``);
		if (settings.economyChannelID && message.channel.id !== settings.economyChannelID) return message.channel.send(`You may only use this command in <#${settings.economyChannelID}>`);

		const data = await economyUser.findOne({ userID: message.author.id });
		if (data?.cooldowns?.WORK > Date.now()) {
			return message.channel.send(`You must wait **${ms(data.cooldowns.WORK - Date.now())}**`);
		}

		const earning = randomNum(800, 250);
		const job = jobs[randomNum(jobs.length)];
		await addMoney(message.author.id, earning);
		return message.channel.send(`You worked as a **${job}** and earnt **${earning}**!`);
	}
};
