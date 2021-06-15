const { Permissions } = require('discord.js');
const emojis = require('../emojis/emojis');

module.exports = {
	name: 'remove-custom-command',
	description: 'Removes a custom command from your server',
	usage: '',
	example: '',
	category: 'Utility',
	aliases: ['ccremove', 'cc-remove', 'remove-cc', 'removecc', 'tag-remove', 'remove-tag'],
	clientPermissions: [Permissions.FLAGS.EMBED_LINKS, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
	async execute({
		message,
		args,
		client,
		utils: { settings: settingsManager }
	}) {
		await message.delete({ timeout: 1000 });

		const msg = await message.channel.send(client.embed('Which command would you like to remove?'));
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

		const settings = await settingsManager.fetch(message.guild.id);
		if (settings.ccommands.length < 1) {
			return msg.edit(
				'This server doesnt have any commands stored!',
				{ embed: null }
			);
		}

		let found = false;
		for (let i = 0; i < settings.ccommands.length; i++) {
			if (settings.ccommands[i].name === m.content) {
				found = true;
				settings.ccommands.splice(i, 1);
			}
		}

		if (found === false) {
			return msg.edit(
				'Your command was not found!',
				{ embed: null }
			);
		}

		await settings.save();
		settingsManager.setCache(settings);

		await m.delete();
		return msg.edit(
			'Your command has successfully been removed!',
			{ embed: null }
		);
	}
};

