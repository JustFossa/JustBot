const { Permissions } = require('discord.js');

module.exports = {
	name: 'disable-automod',
	description: 'Disables automod',
	usage: '',
	example: '',
	category: 'Moderation',
	modBypass: true,
	clientPermissions: [Permissions.FLAGS.ADMINISTRATOR, Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
	async execute({ message, settings, utils: { settings: settingsManager } }) {
		let enabled = false;
		for (const setting in settings.autoMod) {
			if (settings.autoMod[setting] === true) enabled = true;
		}

		if (!enabled) return message.channel.send('You currently don\'t any automod settings enabled');

		for (const setting in settings.autoMod) {
			if (settings.autoMod[setting] === true) {
				settings.autoMod[setting] = false;
				await settings.save();
				await settingsManager.setCache(settings);
			}
		}

		return message.channel.send('Disabled automod');
	}
};
