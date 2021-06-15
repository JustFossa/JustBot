const { Permissions } = require('discord.js');
module.exports = {
	name: 'set-log-channel',
	description: 'Set the logs channel for your server',
	usage: '<#channel>',
	example: '#logs',
	category: 'Moderation',
	modBypass: true,
	clientPermissions: [Permissions.FLAGS.VIEW_AUDIT_LOG, Permissions.FLAGS.MANAGE_WEBHOOKS, Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
	aliases: ['setlogs', 'set-logs', 'mod-channel', 'modlogs', 'logs', 'log'],
	async execute({ message, client, utils: { logger: logUtil }, args }) {
		const member = message.member;
		const channel = message.channel;
		await message.delete();

		const channelIdMatch = args[0]?.match(/\d+/) || [message.channel.id];
		if (!channelIdMatch) return channel.temp('An invalid channel was provided!');

		const channelId = channelIdMatch[0];
		const logChannel = message.guild.channels.cache.get(channelId);

		if (!logChannel) return channel.send('This channel was not found!');

		try {
			await logUtil.setChannel(logChannel.guild.id, logChannel.id);
		} catch (err) {
			console.error(err);
			return channel.send('An error occured while setting the log channel!');
		}

		await channel.send('**Successfully** set the log channel!');
	}
};
