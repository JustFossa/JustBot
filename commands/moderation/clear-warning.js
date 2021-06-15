const Warns = require('../../models/warns');
const { Permissions } = require('discord.js');
const emojis = require('../emojis/emojis');

module.exports = {
	name: 'clear-warnings',
	description: 'Removes a warning from someone',
	usage: '',
	example: '',
	category: 'Moderation',
	aliases: ['clear-warning', 'clear-warn', 'cw'],
	modBypass: true,
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [Permissions.FLAGS.KICK_MEMBERS, Permissions.FLAGS.BAN_MEMBERS, Permissions.FLAGS.MANAGE_ROLES],
	async execute({ message, client }) {
		const { guild, channel } = message;
		message.delete();

		const msg = await message.channel.send(client.embed('Who would you like to remove a warning from?'));
		const awaited = await message.channel.awaitMessages(
			msg => msg.author.id === message.author.id,
			{ max: 1, time: 60000, errors: ['time'] }
		).catch(() => null);

		if (!awaited) {
			return msg.edit(`${emojis.cross} The command timed-out, please type the command to try again!`, { embed: null });
		}

		const m = awaited?.first();
		await m?.delete();
		if (m?.content?.toLowerCase() === 'stop') {
			return msg.edit(`${emojis.tick} Command successfully terminated!`, { embed: null });
		}

		const member = message.guild.member(m.mentions.users.first() || m.content);
		if (!member) return;

		let memberWarns;
		try {
			memberWarns = await guild.members.fetch(member.id);
			if (message.member.id !== guild.ownerID) {
				const permissionDiff = message.member.roles.highest.comparePositionTo(memberWarns.roles.highest);
				if (permissionDiff < 0) {
					return message.channel.temp('You can\'t remove warns someone with higher role!');
				} else if (permissionDiff === 0) {
					return message.channel.temp('You can\'t remove warns someone with equal role!');
				}
			}
		} catch (err) {
			if (err && err.httpStatus === 404) return message.channel.send('This user was not found!');
			throw err;
		}

		const userWarns = await Warns.findOne({ id: memberWarns.id });

		let warns;
		if (userWarns) {
			warns = userWarns.warns;
		} else {
			warns = [];
		}

		if (!warns.length) return msg.edit('This user has no warnings!', { embed: null });

		await msg.edit(client.embed(`Here is a list of their current warnings,\n\n${warns.map((warn, index) => `**\`${index + 1}.\`** \`${warn.reason}\``).join('\n')}\n\nWhich would you like to remove? If you would like to remove all of them say "all".`));
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

		await mText.delete();

		if (mText.content.toLowerCase() === 'all') {
			await Warns.deleteOne({ id: member.id });

			return msg.edit('Successfully removed warning(s).', { embed: null });
		} else if (mText.content.match(/\d+/g)) {
			warns.forEach(async (warn, index) => {
				if (parseInt(mText.content - 1, 10) !== index) return;

				const userWarns = await Warns.findOne({ id: member.id });
				userWarns.warns.pull(warn);
				await userWarns.save();
			});

			return msg.edit('Successfully removed warning.', { embed: null });
		}

		msg.edit('Invalid response.', { embed: null });
	}
};
