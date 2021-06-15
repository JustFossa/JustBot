const { Permissions } = require('discord.js');
const emojis = require('../emojis/emojis');

module.exports = {
	name: 'set-suggest-channel',
	description: 'Set a suggestion channel in the current server',
	usage: '',
	example: '',
	category: 'Utility',
	aliases: ['suggestion-channel', 'suggest-channel'],
	clientPermissions: [Permissions.FLAGS.MANAGE_CHANNELS, Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [Permissions.FLAGS.MANAGE_GUILD],

	async execute({
		message,
		config,
		settings,
		utils: { settings: settingsManager },
		client
	}) {
		config.hold.add(`${message.guild.id}:message_deleted`);
		await message.delete().catch(() => config.hold.delete(`${message.guild.id}:message_deleted`));

		const msg = await message.channel.send(client.embed('Mention the channel in which you would like all the suggestions to go'));
		const awaited = await message.channel.awaitMessages(
			msg => msg.author.id === message.author.id,
			{ max: 1, time: 30000, errors: ['time'] }
		).catch(() => null);

		if (!awaited) {
			return msg.edit(`${emojis.cross} The command timed-out, please type the command to try again!`, { embed: null });
		}

		const m = awaited?.first();
		if (m?.content?.toLowerCase() === 'stop') {
			await m.delete();
			return msg.edit(`${emojis.tick} Command successfully terminated!`, { embed: null });
		}

		const mentioned = message.guild.channels.cache.get(m.content?.match(/\d+/)?.[0]);
		if (!mentioned) return msg.edit('Nothing mentioned', { embed: null });

		try {
			settings.suggestionChannelID = mentioned.id;
			await settingsManager.save(settings);
		} catch (err) {
			console.error(err);
			return msg.edit('Failed saving channel', { embed: null });
		}

		await m.delete();
		return msg.edit(
			`Suggestion channel set to ${mentioned}`,
			{ embed: null }
		);
	}
};
