const { Permissions } = require('discord.js');

module.exports = {
	name: 'server-invite',
	description: 'Provides a permanent invite for the curent server',
	usage: '',
	example: '',
	category: 'Utility',
	aliases: ['sinvite', 'inv'],
	clientPermissions: [Permissions.FLAGS.CREATE_INSTANT_INVITE, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [],
	execute({ message, args }) {
		message.channel.createInvite({ maxAge: 0 }).then(invite => message.channel.send(invite.url));
	}
};
