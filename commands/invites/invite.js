
const { Permissions } = require('discord.js');

module.exports = {
	name: 'user-invites',
	description: 'Provides the total invites for the requested user',
	usage: '<userID>',
	example: '434693228189712385',
	category: 'Utility',
	aliases: ['invites'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [],
	async execute({ message, args, client }) {
		const user = message.mentions.users.first() || client.users.cache.get(args[0]) || message.author;
		if (!message.guild.me.permissions.has('MANAGE_GUILD')) {
			return message.channel.send('I don\'t have `MANAGE_SERVER` permission.');
		}

		const invites = await message.guild.fetchInvites();
		const filtered = invites.filter(inv => inv.inviter && inv.inviter.id === user.id);

		return message.channel.send({
			embed: {
				color: global.config.color,
				description: `**${user.tag}** has **${filtered.size}** invites!`
			}
		});
	}
};
