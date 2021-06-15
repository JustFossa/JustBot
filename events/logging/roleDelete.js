module.exports = async (client, role) => {
	if (!role.guild.me.permissions.has('VIEW_AUDIT_LOG')) return;

	const audits = await role.guild.fetchAuditLogs({
		type: 'ROLE_DELETE',
		limit: 1
	}).catch(() => null);

	const audit = audits?.entries.first();
	if (!audit) return;

	return role.guild.log({
		embeds: [{
			title: '**Role Deleted:**',
			description: `**Actioned By:**\n\`${audit.executor.tag}\`\n\n**Role:**\n\`${role.name}\``,
			color: client.config.color
		}]
	}).catch(() => null);
};
