const { Permissions } = require('discord.js');
module.exports = {
	name: 'unban-user',
	description: 'Unbans the specified user from the current guild',
	usage: '<userID>',
	example: '434693228189712385',
	category: 'Moderation',
	aliases: ['uban', 'unban'],
	modBypass: true,
	clientPermissions: [Permissions.FLAGS.BAN_MEMBERS, Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [Permissions.FLAGS.BAN_MEMBERS],
	args: true,
	logs: true,
	async execute({ client, message, utils: { logger: logUtil }, color, args }) {
		const { member, content, guild, channel } = message;
		client.config.hold.add(`${message.guild.id}:message_deleted`);
		await message.delete().catch(() => client.config.hold.delete(`${message.guild.id}:message_deleted`));

		const userIdMatch = args[0].match(/\d+/);
		if (!userIdMatch) return channel.temp('No user was provided!');

		const userId = userIdMatch[0];

		let user;
		try {
			user = await client.users.fetch(userId);
		} catch (err) {
			if (err && err.httpStatus && err.httpStatus === 404) return message.channel.temp('This user was not found!');
			return console.error(err);
		}

		try {
			await logUtil.ensureEmbed(channel);
		} catch (err) {
			return;
		}

		const reason = args.splice(1).join(' ');

		try {
			await guild.members.unban(userId, reason);
		} catch (err) {
			if (err.httpStatus === 404) return channel.temp('This user is not banned!');
			console.log(err);
			return channel.temp('Failed banning user!');
		}

		channel.temp(`**${user.username}** successfully unbanned!`);
	}
};
