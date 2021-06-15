const { Permissions } = require('discord.js');
module.exports = {
	name: 'unlock-channel',
	description: 'Unlocks the current channel allowing users to send messages in the server again',
	usage: '',
	example: '',
	category: 'Moderation',
	aliases: ['unlock'],
	modBypass: true,
	clientPermissions: [Permissions.FLAGS.MANAGE_CHANNELS, Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [Permissions.FLAGS.MANAGE_CHANNELS],
	logs: true,
	async execute({ message, color, utils, client }) {
		client.config.hold.add(`${message.guild.id}:message_deleted`);
		await message.delete().catch(() => client.config.hold.delete(`${message.guild.id}:message_deleted`));
		const { member, channel, guild } = message;

		if (channel.permissionsFor(guild.id).has('SEND_MESSAGES')) return message.channel.send('Channel already unlocked!');

		utils.locks.unlock(channel);

		guild.log({
			embeds: [{
				title: '**Channel Unlocked**',
				description: `**Actioned by:**\n\`\`\`${member.user.tag}\`\`\`\n**Channel:**\n${channel}`,
				color
			}]
		});

		channel.temp('Channel successfully unlocked!');
	}
};
