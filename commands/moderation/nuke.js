const { Permissions } = require('discord.js');
const emojis = require('../emojis/emojis');

module.exports = {
	name: 'nuke-channel',
	logs: true,
	usage: '',
	example: '',
	category: 'Moderation',
	aliases: ['nuke', 'clone'],
	description: 'Deletes all messages in a channel',
	modBypass: true,
	userPermissions: [Permissions.FLAGS.MANAGE_CHANNELS],
	clientPermissions: [Permissions.FLAGS.MANAGE_CHANNELS],

	async execute({ client, message }) {
		const msg = await message.channel.send('Are you sure you would like to nuke this channel?');
		const awaited = await message.channel.awaitMessages(
			msg => msg.author.id === message.author.id,
			{ max: 1, time: 30000, errors: ['time'] }
		).catch(() => null);

		const m = awaited?.first();
		if (m?.content?.toLowerCase() !== 'yes') {
			return msg.edit(`${emojis.tick} Command successfully terminated!`);
		}

		let cloned;

		try {
			cloned = await message.channel.clone();
			await message.channel.delete();

			return message.guild.log({
				embeds: [{
					title: '**Channel Nuked**',
					description: `**Actioned by:**\n\`${message.author.tag}\`\n\n**Channel:**\n\`${cloned.name}\``,
					color: client.config.color
				}]
			});
		} catch (err) {
			if (cloned) await cloned.delete();

			message.channel.send('Cannot nuke a community required channel.');
		}
	}
};
