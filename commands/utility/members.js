const Discord = require('discord.js');
const { Permissions } = require('discord.js');
module.exports = {
	name: 'server-members',
	description: 'Provides the statuses of users in the current guild',
	usage: '',
	example: '',
	category: 'Utility',
	aliases: ['members', 'stats'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [],
	async execute({ message, args }) {
		const members = message.guild.members.cache;
		const embed = new Discord.MessageEmbed();
		const output = embed
			.setColor(global.config.color);

		output
			.setDescription([
				`**Total: \`${message.guild.memberCount}\` members**`,
				'',
				`Online: \`${members.filter(m => m.presence.status === 'online').size
				}\``,
				`Idle: \`${members.filter(m => m.presence.status === 'idle').size
				}\``,
				`DND: \`${members.filter(m => m.presence.status === 'dnd').size
				}\``,
				`Offline: \`${members.filter(m => m.presence.status === 'offline').size
				}\``
			]);
		return message.channel.send(embed);
	}
};
