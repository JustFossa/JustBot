const { Permissions } = require('discord.js');

module.exports = {
	name: 'report-user',
	description: 'Reports the specified user to the bot admins',
	example: '@sparky#0001 spamming the bot',
	args: true,
	usage: '<@user> <reason>',
	category: 'Utility',
	aliases: ['report'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [],
	async execute({ message, client, args }) {
		if (!message.mentions.members.size) return;
		message.channel.send('I have reported the user to the bot admins.');

		const reason = [...args];
		reason.shift();

		const masterLogger = client.channels.cache.get('836627602578997259');
		if (masterLogger) {
			await masterLogger.send({
				embed: {
					title: 'New Report',
					description: [
						'**Actioned by:**',
						`\`\`\`\n${message.author.tag}\n\`\`\``,
						'**User ID:**',
						`\`\`\`\n${message.author.id}\n\`\`\``,
						'**Culprit:**',
						`\`\`\`\n${message.mentions.members.first().user.tag}\n\`\`\``,
						'**Culprit ID:**',
						`\`\`\`\n${message.mentions.members.first().user.id}\n\`\`\``,
						'**Reason:**',
						`\`\`\`\n${reason.join(' ')}\n\`\`\``
					].join('\n'),
					color: global.config.color
				}
			});
		}
	}
};
