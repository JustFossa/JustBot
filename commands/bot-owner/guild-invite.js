const { Permissions, MessageEmbed } = require('discord.js');
const emojis = require('../emojis/emojis');

module.exports = {
	name: 'guild-invite',
	description: 'Returns the specified users avatar',
	usage: '<userID>',
	example: '434693228189712385',
	aliases: ['mutual'],
	ownerOnly: true,
	category: 'Owner Only',
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [],

	async execute({ message, args, client }) {
		const guildID = args[0]?.match(/\d+/)?.[0];

		const guild = client.guilds.cache.get(guildID);
		if (!guild) {
			return message.channel.send(`${emojis.cross} Guild not found!`);
		}

		if (!guild.me.hasPermission('CREATE_INSTANT_INVITE')) {
			return message.channel.send(`${emojis.cross} Missing Permission`);
		}

		const channel = guild.channels.cache.filter(ch => ch.type === 'text').first();
		const invite = await channel.createInvite();

		return message.channel.send(invite.toString());
	}
};
