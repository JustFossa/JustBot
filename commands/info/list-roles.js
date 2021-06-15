const { Permissions } = require('discord.js');

module.exports = {
	name: 'list-roles',
	description: 'Displays information about roles in your server',
	usage: '',
	example: '',
	category: 'Utility',
	aliases: ['listroles', 'lroles'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.MANAGE_ROLES, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [Permissions.FLAGS.MANAGE_ROLES],
	execute({ message, args }) {
		const roles = message.guild.roles.cache;
		return message.channel.send(
			[
				`Total Roles: ${roles.size}\n(ME: Mention Everyone Perms)`,
				'',
				`${roles.map(m => `${m.name.padEnd(20, '\u2002')}: ${m.id.padEnd(20, '\u2002')} ME:${m.permissions.has('MENTION_EVERYONE') ? '☑️' : 'N/A'}`).join('\n')}`

			],
			{ split: true, code: 'js' }
		);
	}
};
