const { MessageEmbed } = require('discord.js');

module.exports = async (client, emoji) => {
	if (!emoji.guild.me.permissions.has('VIEW_AUDIT_LOG')) return;
	const audits = await emoji.guild.fetchAuditLogs({
		type: 'EMOJI_DELETE',
		limit: 1
	}).catch(() => null);

	if (!audits) return;
	const audit = audits.entries.first();
	if (!audit) return;

	const embed = new MessageEmbed()
		.setColor(client.config.color)
		.setTitle('Emoji Delete')
		.setDescription([
			'**Actioned By:**',
			`\`${audit.executor.tag}\``,
			'',
			'**Name:**',
			`\`${emoji.name}\``,
			'',
			'**ID:**',
			`\`${emoji.id}\``
		]);

	return emoji.guild.log({
		embeds: [embed]
	}).catch(() => null);
};
