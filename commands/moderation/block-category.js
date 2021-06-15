const { Permissions } = require('discord.js');
module.exports = {
	name: 'block-category',
	description: 'Blocks the current category from bot commands',
	usage: '',
	example: '',
	category: 'Moderation',
	aliases: ['blockcat', 'blockcategory'],
	clientPermissions: [Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
	logs: true,
	modBypass: true,
	async execute({ message, utils, config }) {
		config.hold.add(`${message.guild.id}:message_deleted`);
		await message.delete().catch(() => config.hold.delete(`${message.guild.id}:message_deleted`));

		const category = message.guild.channels.cache.filter(channel => channel.id === message.channel.parentID).first();
		const doc = await utils.categoryBlock.toggleActive(category.id);

		await message.guild.log({
			embeds: [{
				title: `Bot Commands ${doc.active ? 'Blocked' : 'Unblocked'}`,
				description: [
					'**Actioned by:**',
					`\`${message.author.tag}\``,
					'',
					'**Category:**',
					category.name
				].join('\n'),
				color: config.color
			}]
		});

		return message.channel.temp(`This category has been ${doc.active ? 'blocked' : 'unblocked'} from bot commands!`, { time: 3000 });
	}
};
