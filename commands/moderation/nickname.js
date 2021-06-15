const { Permissions } = require('discord.js');
const emojis = require('../emojis/emojis');

module.exports = {
	name: 'change-nickname',
	description: 'Sets a nickname for the specified user in the current server',
	usage: '<mentionUser> <newName>',
	example: '@spark sparky',
	category: 'Moderation',
	aliases: ['change-nickname', 'cn', 'nick', 'nickname'],
	modBypass: true,
	clientPermissions: [Permissions.FLAGS.MANAGE_NICKNAMES, Permissions.FLAGS.CHANGE_NICKNAME, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [Permissions.FLAGS.MANAGE_NICKNAMES],
	async execute({
		message,
		client
	}) {
		const msg = await message.channel.send(client.embed('Who would you like to nickname?'));
		const awaited = await message.channel.awaitMessages(
			msg => msg.author.id === message.author.id,
			{ max: 1, time: 60000, errors: ['time'] }
		).catch(() => null);

		if (!awaited) {
			return msg.edit(`${emojis.cross} The command timed-out, please type the command to try again!`, { embed: null });
		}

		const m = awaited?.first();
		await m.delete();
		if (m?.content?.toLowerCase() === 'stop') {
			return msg.edit(`${emojis.tick} Command successfully terminated!`, { embed: null });
		}

		await msg.edit(client.embed('What would you like their nickname to be?'));
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

		message.delete().then(() => { });
		const {
			guild,
			author
		} = message;
		const member = message.guild.member(m?.content?.toLowerCase() === 'self' ? message.author.id : m.mentions.users.first() || m.content);
		if (!member) return msg.edit('I could not find this user!', { embed: null });
		const nick = mText.content;

		if (guild.ownerID !== author.id) {
			if (member.id !== author.id) {
				const permissionDiff = message.member.roles.highest.comparePositionTo(member.roles.highest);
				if (permissionDiff < 0) {
					return msg.edit('You can\'t change nickname of someone with higher role', { embed: null });
				} else if (permissionDiff === 0) {
					return msg.edit('You can\'t change nickname of someone with equal role', { embed: null });
				}
			}
		}

		try {
			await member.setNickname(nick);
		} catch (err) {
			return msg.edit('Failed to set nickname', { embed: null });
		}

		return msg.edit(`Successfully set **${member.user.tag}** nickname to \`${member.displayName}\``, { embed: null });
	}
};
