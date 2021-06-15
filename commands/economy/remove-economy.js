const Discord = require('discord.js');
const { Permissions } = require('discord.js');

module.exports = {
	name: 'remove-economy',
	description: 'Unset the economy channel',
	usage: '',
	example: '',
	category: 'Economy',
	aliases: ['rm-eco', 'rme'],
	clientPermissions: [Permissions.FLAGS.MANAGE_CHANNELS, Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [Permissions.FLAGS.MANAGE_GUILD],

	async execute({ message, settings, utils: { settings: settingsManager } }) {
		if (!settings.economyChannelID) return message.channel.send('You currently don\'t have an economy channel set!');
		settings.economyChannelID = null;
		await settings.save();
		await settingsManager.setCache(settings);
		return message.channel.send('Unset economy channel');
	}
};
