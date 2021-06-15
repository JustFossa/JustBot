const { Permissions } = require('discord.js');
module.exports = {
	name: 'kick-user',
	description: 'Kicks the user from the current guild',
	usage: '<mentionUser> or <userID>',
	example: '12345667788',
	category: 'Moderation',
	aliases: ['kick'],
	modBypass: true,
	clientPermissions: [Permissions.FLAGS.KICK_MEMBERS, Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [Permissions.FLAGS.KICK_MEMBERS],
	args: true,
	logs: true,
	async execute({ client, message, args, utils: { logger: logUtil } }) {
		client.config.hold.add(`${message.guild.id}:message_deleted`);
		await message.delete().catch(() => client.config.hold.delete(`${message.guild.id}:message_deleted`));

		const member = message.member;

		const userIdMatch = args[0].match(/\d+/);
		if (!userIdMatch) return message.channel.temp('No user provided!');

		const userId = userIdMatch[0];

		let memberKick;

		try {
			memberKick = await message.guild.members.fetch(userId);
		} catch (err) {
			if (err && err.httpStatus && err.httpStatus === 404) return message.channel.temp('This user was not found!');
			return console.error(err);
		}

		const permissionDiff = member.roles.highest.comparePositionTo(memberKick.roles.highest);
		if (permissionDiff < 0) {
			return message.channel.temp('You can\'t kick someone with higher role!');
		} else if (permissionDiff === 0) {
			return message.channel.temp('You can\'t kick someone with equal role!');
		}

		if (!memberKick.kickable) return message.channel.temp('User not bannable by bot!');

		const reason = args.slice(1).join(' ');

		try {
			await logUtil.ensureEmbed(message.channel);
		} catch (err) {
			return;
		}

		memberKick.kick(reason || undefined)
			.then(() => message.channel.temp(`**${memberKick.nickname || memberKick.user.username}** successfully kicked!`))
			.catch(err => {
				console.error(err);
				return message.channel.temp('An error occured while kicking user!');
			});
	}
};
