const { Permissions, Util } = require('discord.js');
const emojis = require('../emojis/emojis');

module.exports = {
	name: 'add-custom-command',
	description: 'Creates a custom command for your server',
	usage: '',
	example: '',
	category: 'Utility',
	aliases: ['ccadd', 'cc-add', 'addcc', 'add-cc', 'add-tag', 'tag-add'],
	clientPermissions: [Permissions.FLAGS.EMBED_LINKS, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [Permissions.FLAGS.MANAGE_GUILD],

	async execute({
		message,
		args,
		config,
		client,
		utils: { settings: settingsManager }
	}) {
		config.hold.add(`${message.guild.id}:message_deleted`);
		await message.delete().catch(() => config.hold.delete(`${message.guild.id}:message_deleted`));

		const msg = await message.channel.send(client.embed('What would you like the command name to be?'));
		const awaited = await message.channel.awaitMessages(
			msg => msg.author.id === message.author.id,
			{ max: 1, time: 60000, errors: ['time'] }
		).catch(() => null);

		if (!awaited) {
			return msg.edit(`${emojis.cross} The command timed-out, please type the command to try again!`, { embed: null });
		}

		const m = awaited?.first();
		if (m?.content?.toLowerCase() === 'stop') {
			await m.delete();
			return msg.edit(`${emojis.tick} Command successfully terminated!`, { embed: null });
		}

		await msg.edit(client.embed('What would you like the reply to be?'));
		const res = await message.channel.awaitMessages(
			msg => msg.author.id === message.author.id,
			{ max: 1, time: 30000, errors: ['time'] }
		).catch(() => null);

		if (!res) {
			return msg.edit(`${emojis.cross} The command timed-out, please type the command to try again!`, { embed: null });
		}

		const mText = res.first();
		if (mText?.content?.toLowerCase() === 'stop') {
			return msg.edit(`${emojis.tick} Command successfully terminated!`, { embed: null });
		}

		const settings = await settingsManager.fetch(message.guild.id);
		settings.ccommands.push({
			name: m.content,
			response: Util.cleanContent(mText.content, message)
		});

		await settings.save();
		settingsManager.setCache(settings);
		return msg.edit('Your command has successfully been added!', { embed: null });
	}
};
