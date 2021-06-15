module.exports = async (client, member) => {
	if (!member.guild?.me?.permissions.has('VIEW_AUDIT_LOG')) return;
	const { guild } = member;
	const audits = await guild.fetchAuditLogs({
		limit: 1,
		type: 'MEMBER_KICK'
	}).catch(() => null);

	const audit = audits?.entries.first();

	if (audit?.createdTimestamp > member.joinedTimestamp && audit?.target.id === member.id) {
		guild.log({
			embeds: [{
				title: '**Member Kicked**',
				description: `**Culprit**\n\`${audit.target.tag}\`\n\n**Reporter:**\n\`${audit?.executor.tag}\`\n\n**Reason:**\n\`${audit?.reason || 'No reason given'}\``,
				color: global.config.color
			}]
		}).catch(() => null);
	}
};
