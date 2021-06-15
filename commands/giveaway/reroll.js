const { Permissions } = require('discord.js');

module.exports = {
	name: 'reroll',
	description: 'Re-rolls the winner for the current giveaway',
	usage: '',
	example: '',
	category: 'Utility',
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [Permissions.FLAGS.MANAGE_GUILD],

	async execute({ message, args, utils, client }) {
		const { channel, member } = message;

		const Giveaway = utils.giveway.model;

		let giveaway;
		if (args[0]) {
			const messageIDMatch = args[0].match(/\d{17,19}/);

			if (!messageIDMatch) return message.channel.send('Please provide valid message ID!');
			const messageID = messageIDMatch[0];
			giveaway = await Giveaway.findOne({ messageID });
		} else {
			giveaway = await Giveaway.findOne({ channelID: channel.id }, undefined, { sort: { 'updatedAt': -1 } });
		}

		if (!giveaway) return message.channel.send('Giveaway not found!');

		const giveawayChannel = utils.giveway.getChannel(giveaway);
		if (!giveawayChannel) {
			await giveaway.remove();
			return message.channel.send('Giveaway channel not found!');
		}

		const giveawayMessage = await utils.giveway.getMessage(giveawayChannel, giveaway);
		if (!giveawayMessage) {
			await giveaway.remove();
			return message.channel.send('Giveaway message not found!');
		}

		const winners = await utils.giveway.chooseWinners(1, giveawayMessage, giveaway.users);

		const winner = winners[0];
		if (!winner) return channel.send('No winner!');

		giveaway.users = [...new Set([...giveaway.users ?? [], winner.id])];
		await giveaway.save();

		return channel.send(`🎉 **The new winner is ${winner}!**`);
	}
};
