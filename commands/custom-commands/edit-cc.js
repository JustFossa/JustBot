const { Permissions, Util } = require('discord.js');
const emojis = require('../emojis/emojis');

module.exports = {
	name: 'edit-custom-command',
	description: 'Edits an existing custom command',
	usage: '',
	example: '',
	category: 'Utility',
	aliases: ['ccedit', 'cc-edit', 'editcc', 'edit-cc', 'tag-edit', 'edit-tag'],
	clientPermissions: [Permissions.FLAGS.EMBED_LINKS, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
	async execute({
		message,
		args,
		client,
		utils: { settings: settingsManager }
	}) {
		await message.delete({ timeout: 1000 });

		const msg = await message.channel.send(client.embed('Which command would you like to edit?'));
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

		await msg.edit(client.embed('What would you like the new reply to be?'));
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
		let list = false;
		const name = m.content.toLowerCase();
		const respond = Util.cleanContent(mText.content, message);

		if (settings.ccommands.length < 1) {
			return msg.edit(
				'This server does not have any custom commands!',
				{ embed: null }
			);
		}

		for (let i = 0; i < settings.ccommands.length; i++) {
			if (settings.ccommands[i].name === name) {
				list = true;
				settings.ccommands[i].response = respond;
			}
		}

		if (list === false) {
			return msg.edit(
				'Command not found, please specify an existing custom command!',
				{ embed: null }
			);
		}

		await settings.save();
		settingsManager.setCache(settings);

		return msg.edit(
			'Your command has successfully been added!',
			{ embed: null }
		);
	}
};
