module.exports = async (client, guild, user) => {
	if (!guild.me.permissions.has('VIEW_AUDIT_LOG')) return;
	const audits = await guild.fetchAuditLogs({
		type: 'MEMBER_BAN_REMOVE',
		limit: 1
	}).catch(() => null);

	const audit = audits?.entries.first();

	if (!audit || audit.target.id !== user.id) return;

	guild.log({
		embeds: [{
			title: '**Member Unbanned**',
			description: `**Unbanned by:**\n\`${audit.executor.tag}\`\n\n**User unbanned:**\n\`${user.tag}\`\n\n**Reason:**\n\`${audit.reason || 'No reason given'}\``,
			color: client.config.color
		}]
	}).catch(() => null);
};
