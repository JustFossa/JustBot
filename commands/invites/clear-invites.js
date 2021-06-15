const { Permissions } = require('discord.js');
const emojis = require('../emojis/emojis');

module.exports = {
	name: 'clear-invites',
	description: 'Clear all invites from a user',
	usage: '<@user>',
	example: '@sparky#0001',
	category: 'Utility',
	aliases: [],
	args: true,
	clientPermissions: [Permissions.FLAGS.MANAGE_GUILD, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [Permissions.FLAGS.MANAGE_GUILD],

	async execute({ message, args, client }) {
		const user = client.users.cache.get(args[1]?.match(/\d+/)?.[0]);
		if (!user) return message.channel.send(`${emojis.cross} You must mention a valid user!`);

		const invites = await message.guild.fetchInvites().catch(() => []);
		for (const invite of invites) {
			if (invite.inviter.id === user.id) {
				await invite.delete();
			}
		}

		return message.channel.send(`${emojis.tick} Successfully deleted all invites from **${user.tag}**`);
	}
};
