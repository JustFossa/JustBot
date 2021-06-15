const { Permissions } = require('discord.js');
module.exports = {
	name: 'block-channel',
	description: 'Blocks the current channel from bot commands',
	usage: '',
	example: '',
	category: 'Moderation',
	aliases: ['block', 'blockchannel', 'ignore'],
	clientPermissions: [Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
	logs: true,
	modBypass: true,
	async execute({ message, utils, config, client }) {
		config.hold.add(`${message.guild.id}:message_deleted`);
		await message.delete().catch(() => config.hold.delete(`${message.guild.id}:message_deleted`));
		const doc = await utils.channelBlock.toggleActive(message.channel.id);

		await message.guild.log({
			embeds: [{
				title: `Bot Commands ${doc.active ? 'Blocked' : 'Unblocked'}`,
				description: [
					'**Actioned by:**',
					`\`${message.author.tag}\``,
					'',
					'**Channel:**',
					message.channel
				].join('\n'),
				color: config.color
			}]
		});

		return message.channel.temp(`This channel has been ${doc.active ? 'blocked' : 'unblocked'} from bot commands!`, { time: 3000 });
	}
};
