const Discord = require('discord.js');
const { Permissions } = require('discord.js');

module.exports = {
	name: 'seteconomy',
	description: 'Set the economy channel',
	usage: '<channel>',
	example: '#economy',
	category: 'Economy',
	aliases: ['economy-channel', 'echannel', 'economychannel', 'set-economy', 'economy'],
	clientPermissions: [Permissions.FLAGS.MANAGE_CHANNELS, Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [Permissions.FLAGS.MANAGE_GUILD],

	async execute({ message, settings, args }) {
		const channel = message.guild.channels.cache.get(args[0]?.match(/\d+/)?.[0]) || message.channel;
		if (channel.type !== 'text') return;
		settings.economyChannelID = channel.id;
		await settings.save();
		return message.channel.send(`Economy channel set to <#${channel.id}>`);
	}
};
