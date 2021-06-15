const { Permissions } = require('discord.js');
const emojis = require('../emojis/emojis');

module.exports = {
	name: 'remove-role',
	description: 'Removes the specified role from the user in the current server',
	usage: '<mentionUser> <roleName>',
	example: '@spark @community',
	category: 'Utility',
	aliases: ['rr', 'removerole'],
	clientPermissions: [Permissions.FLAGS.MANAGE_ROLES, Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [Permissions.FLAGS.MANAGE_ROLES],
	logs: true,
	modBypass: true,
	async execute({ message, color, config, client }) {
		message.delete();
		const msg = await message.channel.send(client.embed('Who would you like to remove a role from?'));
		const awaited = await message.channel.awaitMessages(
			msg => msg.author.id === message.author.id,
			{ max: 1, time: 60000, errors: ['time'] }
		).catch(() => null);

		if (!awaited) {
			return msg.edit(`${emojis.cross} The command timed-out, please type the command to try again!`, { embed: null });
		}

		const m = awaited?.first();

		if (m?.content?.toLowerCase() === 'stop') {
			await m.delete();
			return msg.edit(`${emojis.tick} Command successfully terminated!`, { embed: null });
		}

		await m.delete();
		await msg.edit(client.embed('What role would you like to remove?'));
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

		mText.delete();

		config.hold.add(`${message.guild.id}:message_deleted`);
		await message.delete().catch(() => config.hold.delete(`${message.guild.id}:message_deleted`));

		const { guild, author } = message;

		const member = message.guild.member(m?.content?.toLowerCase() === 'self' ? message.author.id : m.mentions.users.first() || m.content);
		if (!member) return msg.edit('I could not find this user!', { embed: null });

		const roleName = mText.content;

		let role = guild.roles.cache.find(r => r.name === roleName) || mText.mentions.roles.first() || guild.roles.cache.find(r => r.id === mText.content);

		if (!role) {
			const roleId = mText.content;
			if (!roleId) return msg.edit('Invalid role provided!', { embed: null });

			role = guild.roles.cache.get(roleId);

			if (!role) return msg.edit('Role not found!', { embed: null });
		}

		if (!member.roles.cache.some(r => r.id === role.id)) return msg.edit('User does not have that role!', { embed: null });

		if (message.member.id !== guild.ownerID) {
			const permissionDiff = message.member.roles.highest.comparePositionTo(role);
			if (permissionDiff < 0) {
				return msg.edit('You can\'t remove a higher role!', { embed: null });
			} else if (permissionDiff === 0) {
				return msg.edit('You can\'t remove a equal role!', { embed: null });
			}
		}

		try {
			await member.roles.remove(role);
		} catch (err) {
			if (err && err.httpStatus === 403) {
				return msg.edit('Missing permissions!', { embed: null });
			}
			console.error(err);
			return msg.edit('Failed to remove role!', { embed: null });
		}

		guild.log({
			embeds: [{
				title: '**Role Removed**',
				description: `**Actioned By:**\n\`${author.tag}\`\n\n**Role:**\n\`${role.name}\`\n\n**Removed from:**\n\`${member.user.tag}\``,
				color
			}]
		});

		msg.edit(`**${member.displayName}** was removed from the \`${role.name}\` role`, { embed: null });
	}
};
