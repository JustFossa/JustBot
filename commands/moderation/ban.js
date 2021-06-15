function temp(message, time = 3000) {
	return message.delete({ timeout: time });
}
const { Permissions } = require('discord.js');
module.exports = {
	name: 'ban-user',
	description: 'Bans a user from the current server',
	usage: '<mentionUser> or <userID>',
	example: '1234567891234',
	category: 'Moderation',
	aliases: ['ban'],
	clientPermissions: [Permissions.FLAGS.BAN_MEMBERS, Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [Permissions.FLAGS.BAN_MEMBERS],
	args: true,
	logs: true,
	modBypass: true,
	async execute({ client, message, args, utils: { logger: logUtil } }) {
		client.config.hold.add(`${message.guild.id}:message_deleted`);
		await message.delete().catch(() => client.config.hold.delete(`${message.guild.id}:message_deleted`));

		const member = message.member;

		const userIdMatch = args[0]?.match(/\d+/);
		if (!userIdMatch) return message.channel.send('No user provided!').then(m => temp(m));
		const userId = userIdMatch[0];

		let user;
		let memberBan;

		try {
			user = await client.users.fetch(userId);
		} catch (err) {
			if (err && err.httpStatus && err.httpStatus === 404) return message.channel.send('This user was not found!').then(m => temp(m));
			console.error(err);
		}

		try {
			memberBan = await message.guild.members.fetch(userId);

			const permissionDiff = member.roles.highest.comparePositionTo(memberBan.roles.highest);
			if (permissionDiff < 0) {
				return message.channel.temp('You can\'t ban someone with higher role!');
			} else if (permissionDiff === 0) {
				return message.channel.temp('You can\'t ban someone with equal role!');
			}

			if (!memberBan.bannable) return message.channel.temp('This user is not bannable by the bot!');
		} catch (err) {
			if (!(err && err.httpStatus && err.httpStatus === 404)) return console.error(err);
		}

		const reason = args.slice(1).join(' ');

		try {
			await logUtil.ensureEmbed(message.channel);
		} catch (err) {
			return;
		}

		message.guild.members.ban(userId, {
			reason: reason || undefined
		})
			.then(() => message.channel.send(` **${user.username}** successfully banned!`).then(m => temp(m)))
			.catch(err => {
				console.error(err);
				return message.channel.send('Error occured while banning user!').then(m => temp(m));
			});
	}
};
