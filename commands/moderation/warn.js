const Warns = require('../../models/warns');
const Mute = require('../../models/mute');
const { Permissions } = require('discord.js');
const ms = require('ms');

const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'warn-user',
	description: 'Warns the specified user',
	usage: '<mentionUser> <reason>',
	example: '@spark spamming',
	category: 'Moderation',
	aliases: ['warn'],
	modBypass: true,
	clientPermissions: [Permissions.FLAGS.KICK_MEMBERS, Permissions.FLAGS.BAN_MEMBERS, Permissions.FLAGS.MANAGE_ROLES, Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [Permissions.FLAGS.KICK_MEMBERS, Permissions.FLAGS.BAN_MEMBERS, Permissions.FLAGS.MANAGE_ROLES],
	args: true,
	logs: true,
	async execute({ client, message, args, color, utils: { muter } }) {
		client.config.hold.add(`${message.guild.id}:message_deleted`);
		await message.delete().catch(() => client.config.hold.delete(`${message.guild.id}:message_deleted`));
		const { guild, member, channel, author } = message;
		function missingPerm(name) {
			// was ment for changing missing permission but with revision were removed and too lazy to edit it
			return message.channel.send('You don\'t have enough permissions to warn!');
		}

		if (args.length < 1) return message.channel.send('This command is missing arguments!');

		const userIdMatch = args[0].match(/\d+/);
		if (!userIdMatch) return message.channel.send('Invalid user provided!');
		const userId = userIdMatch[0];


		let memberWarn;
		try {
			memberWarn = await guild.members.fetch(userId);
			if (memberWarn.user.bot) return channel.temp('You cannot warn a bot!');
			if (memberWarn.id === author.id) return channel.temp('You can not warn yourself!', { time: 10000 });
			if (member.id !== guild.ownerID) {
				const permissionDiff = member.roles.highest.comparePositionTo(memberWarn.roles.highest);
				if (permissionDiff < 0) {
					return message.channel.temp('You can\'t warn someone with higher role!');
				} else if (permissionDiff === 0) {
					return message.channel.temp('You can\'t warn someone with equal role!');
				}
			}
		} catch (err) {
			if (err && err.httpStatus === 404) return message.channel.send('This user was not found!');
			throw err;
		}

		const reason = args.splice(1).join(' ') || 'No reason provided';

		const warn = {
			reason,
			moderator: author.id
		};

		let userWarns = await Warns.findOne({ id: memberWarn.id });
		if (!userWarns) {
			userWarns = new Warns({
				id: memberWarn.id,
				warns: [warn]
			});
		} else {
			userWarns.warns.push(warn);
		}

		await userWarns.save();

		if (userWarns.warns.length === 2) {
			let mute = await Mute.findOne({ guildID: guild.id, userID: memberWarn.id });

			if (memberWarn.roles.cache.some(r => r.name === 'Muted') || (mute && mute.muted)) return channel.temp('This user is already muted!');

			const muteRole = await muter.getRole(memberWarn.guild.roles);

			try {
				await memberWarn.roles.add(muteRole);
			} catch (err) {
				console.error(err);
				return channel.temp('Failed to mute this user!');
			}

			const date = new Date();
			date.setTime(date.getTime() + (10 * 60 * 1000));

			if (!mute) {
				mute = new Mute({
					guildID: memberWarn.guild.id,
					userID: memberWarn.id,
					timestamp: date,
					muted: true
				});
			} else {
				mute.timestamp = date;
				mute.muted = true;
			}
			await mute.save();

			const displayTime = ms(10 * 60 * 1000);

			guild.log({
				embeds: [{
					title: '**Member Muted**',
					description: `**Culprit:**\n\`${memberWarn.user.tag}\`\n\n**Reporter:**\n\`${author.tag}\`\n\n**Time:**\n\`${displayTime}\``,
					color
				}]
			});

			channel.temp(`**${memberWarn.displayName}** successfully muted for \`${displayTime}\``);
			try {
				await muter.setTimer(mute, memberWarn);
			} catch (err) {
				console.error(err);
				return channel.temp('Failed to unmute user!');
			}

			channel.send(`${memberWarn} you have now been unmuted!`);
		}

		guild.log({
			embeds: [{
				title: 'User Warned',
				description: `Culprit:\n\`\`\`${memberWarn.user.tag}\`\`\`\n\nWarned by:\n\`\`\`${author.tag}\`\`\`\nReason:\n\`\`\`${reason}\`\`\`\nWarns:\n\`${userWarns.warns.length}\``,
				color
			}]
		});
		memberWarn.send(`~ sent from ${guild.name}`, {
			embed: new MessageEmbed({
				title: 'You have been warned!',
				description: `Warned by:\n\`\`\`${author.tag}\`\`\`\nReason:\n\`\`\`${reason}\`\`\`\nWarns:\n\`${userWarns.warns.length}\``,
				color
			})
		}).catch(() => { });

		channel.send(`\`${memberWarn.user.tag}\` successfully warned!`);
	}
};
