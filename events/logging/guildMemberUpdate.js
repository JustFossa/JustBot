function notIn(coll) {
	return (v, id) => !coll.has(id);
}

module.exports = async (client, oldMember, newMember) => {
	if (oldMember.premiumSinceTimestamp === 0 && newMember.premiumSinceTimestamp > 0) {
		newMember.guild.log({
			embeds: [{
				title: '**New Boost**',
				description: [
					'**Actioned by:**',
					`\`${newMember.user.tag}\``
				],
				color: client.config.color
			}]
		}).catch(() => null);
	}

	if (oldMember.nickname !== newMember.nickname) {
		if (!newMember.guild.me.permissions.has('VIEW_AUDIT_LOG')) return;
		const audits = await newMember.guild.fetchAuditLogs({
			type: 'MEMBER_UPDATE',
			limit: 1
		}).catch(() => null);
		const audit = audits?.entries.first();
		if (!audit) return;

		newMember.guild.log({
			embeds: [{
				title: '**Nickname changed**',
				description: `**For User:**\n\`${newMember.user.tag}\`\n\n**Before:**\n\`${oldMember.displayName}\`\n\n**After:**\n\`${newMember.displayName}\`\n\n**Actioned by:**\n\`${audit.executor.tag}\``,
				color: client.config.color
			}]
		}).catch(() => null);
	}

	if (oldMember.roles.cache !== newMember.roles.cache) {
		if (!newMember.guild.me.permissions.has('VIEW_AUDIT_LOG')) return;
		const audits = await newMember.guild.fetchAuditLogs({
			type: 'MEMBER_ROLE_UPDATE',
			limit: 1
		}).catch(() => null);
		const audit = audits?.entries.first();
		if (!audit) return;

		const removed = oldMember.roles.cache.filter(notIn(newMember.roles.cache));
		const added = newMember.roles.cache.filter(notIn(oldMember.roles.cache));

		removed.each(roleRemoved => {
			newMember.guild.log({
				embeds: [{
					title: '**Role removed**',
					description: [
						'**User:**',
						`\`${newMember.user.tag}\``,
						'',
						'**Role:**',
						`\`${roleRemoved.name}\``,
						'',
						'**Actioned by:**',
						`\`${audit.executor.tag}\``
					].join('\n'),
					color: client.config.color
				}],
				color: client.config.color
			}).catch(() => null);
		});
		added.each(roleAdded => {
			newMember.guild.log({
				embeds: [{
					title: '**Role added**',
					description: [
						'**User:**',
						`\`${newMember.user.tag}\``,
						'',
						'**Role:**',
						`\`${roleAdded.name}\``,
						'',
						'**Actioned by:**',
						`\`${audit.executor.tag}\``
					].join('\n'),
					color: client.config.color
				}],
				color: client.config.color
			}).catch(() => null);
		});
	}
};
