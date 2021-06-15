const ms = require('ms');
const { Permissions } = require('discord.js');
const emojis = require('../emojis/emojis');
module.exports = {
	name: 'channel-slowmode',
	description: 'Setting the slowmode for the current channel',
	usage: '<time>',
	example: '25s',
	category: 'Moderation',
	aliases: ['slowmode'],
	modBypass: true,
	clientPermissions: [Permissions.FLAGS.MANAGE_CHANNELS, Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [Permissions.FLAGS.MANAGE_CHANNELS],
	args: true,
	logs: true,
	async execute({ message, args, color, client }) {
		client.config.hold.add(`${message.guild.id}:message_deleted`);
		await message.delete().catch(() => client.config.hold.delete(`${message.guild.id}:message_deleted`));

		const { member, channel, guild, author } = message;
		let time = ms(args[0]);
		if (!time) return message.channel.send(`${emojis.cross} You must provide a valid duration.`);
		time = Math.min(21600 * 1000, time);

		try {
			await channel.setRateLimitPerUser(time / 1000);
		} catch (err) {
			console.error(err);
			return channel.temp('Failed to set the slowmode for this channel!');
		}

		channel.temp(`Successfully set the slowmode for this channel to \`${time}\``);
	}
};
