const path = require('path');

class Logger {
	constructor(client, settingsManager) {
		this.client = client;
		this.settingsManager = settingsManager;
	}

	async setChannel(guildID, channelID) {
		const settings = await this.settingsManager.fetch(guildID);
		settings.logChannelID = channelID;
		settings.save();
		this.settingsManager.setCache(settings);
	}

	async getChannel(guildID) {
		const settings = await this.settingsManager.fetch(guildID);
		return settings.logChannelID;
	}

	async ensureWebhook(guildID) {
		const settings = await this.settingsManager.fetch(guildID);
		const { logChannelID: channelID, webhookUrl } = settings;
		if (!channelID) return null;

		const channel = this.client.channels.cache.get(channelID);
		if (!channel) return null;

		if (channel.type !== 'text') return null;

		if (!channel.guild.me.hasPermission('MANAGE_WEBHOOKS')) return null;

		const webhooks = await channel.fetchWebhooks();
		let webhook = webhooks.find(w => w.url === webhookUrl);
		if (!webhookUrl || !webhook) {
			webhook = await channel.createWebhook('FPIT', {
				avatar: path.join(__dirname, '../images/pfp.png')
			});
			settings.webhookUrl = webhook.url;
			await settings.save();
			this.settingsManager.setCache(settings);
		}

		return webhook;
	}

	async ensureEmbed(channel) {
		const webhook = await this.ensureWebhook(channel.guild.id).catch(() => null);
		if (!webhook) {
			const settings = this.settingsManager.fetch(channel.guild.id);
			const prefix = settings.prefix || this.client.config.prefix;
			await channel.send(`You have to setup a log channel in order to use this command:\n\n\`\`\`${prefix}setlogs #channel\`\`\``);
			return null;
		}
		return webhook;
	}

	async log(message, guildID, options) {
		const webhook = await this.ensureWebhook(guildID).catch(() => null);
		if (!webhook) return;
		return webhook.send(message, options);
	}
}

module.exports = {
	name: 'logger',
	construct(client) {
		return new Logger(client, client.utils.settings);
	}
};
