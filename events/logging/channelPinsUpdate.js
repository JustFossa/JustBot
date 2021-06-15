const { MessageEmbed } = require('discord.js');

module.exports = async (client, channel) => {
	if (channel.type !== 'text') return;
	if (!channel.guild.me.permissions.has('VIEW_AUDIT_LOG')) return;
	const audits = await channel.guild.fetchAuditLogs({
		limit: 1
	}).catch(() => null);

	if (!audits) return;
	const audit = audits.entries.filter(en => ['MESSAGE_PIN', 'MESSAGE_UNPIN'].includes(en.action)).first();
	if (!audit) return;

	const embed = new MessageEmbed()
		.setColor(client.config.color)
		.setTitle(`Message ${audit.actionType === 'DELETE' ? 'Unpinned' : 'Pinned'}`)
		.setDescription([
			'**Actioned By:**',
			`\`${audit.executor.tag}\``,
			'',
			'**Channel:**',
			channel,
			'',
			'**Message:**',
			`[Click me!](https://discordapp.com/channels/${channel.guild.id}/${channel.id}/${audit.extra.messageID})`
		]);

	return channel.guild.log({
		embeds: [embed]
	}).catch(() => null);
};
