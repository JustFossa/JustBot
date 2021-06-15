const { MessageEmbed } = require('discord.js');

module.exports = async (client, oldEmoji, newEmoji) => {
	if (!newEmoji.guild.me.permissions.has('VIEW_AUDIT_LOG')) return;
	const audits = await newEmoji.guild.fetchAuditLogs({
		type: 'EMOJI_DELETE',
		limit: 1
	}).catch(() => null);

	if (!audits) return;
	const audit = audits.entries.first();
	if (!audit) return;
	const embed = new MessageEmbed()
		.setColor(client.config.color)
		.setTitle('Emoji Update')
		.setDescription([
			'**Actioned by:**',
			`\`${audit.executor.tag}\``,
			'',
			'**Old Name:**',
			`\`${oldEmoji.name}\``,
			'',
			'**New Name:**',
			`\`${newEmoji.name}\``,
			'',
			'**Emoji:**',
			`${newEmoji.toString()} \u200b`
		]);

	return newEmoji.guild.log({
		embeds: [embed]
	}).catch(() => null);
};
