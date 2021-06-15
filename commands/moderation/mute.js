const Mute = require('../../models/mute');
const { Permissions } = require('discord.js');
const ms = require('ms');

module.exports = {
	name: 'mute-user',
	description: 'Mutes the specified user for a set amount of time',
	usage: '<mentionUser> <time>',
	example: '@spark 2h',
	category: 'Moderation',
	aliases: ['mute'],
	modBypass: true,
	clientPermissions: [Permissions.FLAGS.MANAGE_ROLES, Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [Permissions.FLAGS.MANAGE_ROLES],
	args: true,
	logs: true,
	async execute({ client, message, args, utils: { muter }, utils: { logger: logUtil }, color }) {
		const { member, channel, guild, author } = message;
		client.config.hold.add(`${message.guild.id}:message_deleted`);
		await message.delete().catch(() => client.config.hold.delete(`${message.guild.id}:message_deleted`));

		const userIdMatch = args[0].match(/\d+/);
		if (!userIdMatch) return channel.temp('Please provide a user!');

		if (!args[1]) return channel.temp('Please specify a time!');

		let muteTime = ms(args[1]);
		muteTime = Math.min(muteTime, 15 * 24 * 60 * 60 * 1000);

		if (!muteTime) return channel.temp('Invalid mute time!');

		const userId = userIdMatch[0];

		let memberMute;

		try {
			memberMute = await guild.members.fetch(userId);
		} catch (err) {
			if (err && err.httpStatus === 404) return channel.temp('This user was not found!');
			return console.error(err);
		}

		const permissionDiff = member.roles.highest.comparePositionTo(memberMute.roles.highest);
		if (permissionDiff < 0) {
			return message.channel.temp('You can\'t mute someone with higher role!');
		} else if (permissionDiff === 0) {
			return message.channel.temp('You can\'t mute someone with equal role!');
		}

		try {
			await logUtil.ensureEmbed(channel);
		} catch (err) {
			return;
		}

		let mute = await Mute.findOne({ guildID: guild.id, userID: memberMute.id });

		if (memberMute.roles.cache.some(r => r.name === 'Muted') || (mute && mute.muted)) return channel.temp('This user is already muted!');

		const muteRole = await muter.getRole(memberMute.guild.roles);

		try {
			await memberMute.roles.add(muteRole);
		} catch (err) {
			return channel.temp('Failed to mute this user!');
		}

		const date = new Date();
		date.setTime(date.getTime() + muteTime);

		if (!mute) {
			mute = new Mute({
				guildID: memberMute.guild.id,
				userID: memberMute.id,
				timestamp: date,
				muted: true
			});
		} else {
			mute.timestamp = date;
			mute.muted = true;
		}
		await mute.save();

		const displayTime = ms(muteTime);

		guild.log({
			embeds: [{
				title: '**Member Muted**',
				description: `**Culprit:**\n\`${memberMute.user.tag}\`\n\n**Reporter:**\n\`${author.tag}\`\n\n**Time:**\n\`${displayTime}\``,
				color
			}]
		});

		channel.temp(`**${memberMute.displayName}** successfully muted for \`${displayTime}\``);
		try {
			await muter.setTimer(mute, memberMute);
		} catch (err) {
			return channel.temp('Failed to unmute this user!');
		}

		channel.send(`${memberMute} you have now been unmuted!`);
	}
};
