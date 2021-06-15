const { Permissions } = require('discord.js');

module.exports = async (client, oldRole, newRole) => {
	if (
		oldRole.color === newRole.color &&
		oldRole.permissions.bitfield === newRole.permissions.bitfield &&
		oldRole.mentionable === newRole.mentionable
	) return;

	if (!newRole.guild.me.permissions.has('VIEW_AUDIT_LOG')) return;

	const audits = await newRole.guild.fetchAuditLogs({
		type: 'ROLE_UPDATE',
		limit: 1
	}).catch(() => null);

	const audit = audits?.entries.first();
	if (!audit) return;

	const changes = [];
	const oldPerm = oldRole.permissions.serialize();
	const newPerm = newRole.permissions.serialize();
	for (const perm of Object.keys(Permissions.FLAGS)) {
		if (oldPerm[perm] === newPerm[perm]) continue;
		changes.push({ value: newPerm[perm], name: perm });
	}

	if (changes.length) {
		await newRole.guild.log({
			embeds: [{
				title: '**Role Permission Updated**',
				description: [
					'**Actioned by:**',
					`\`${audit.executor.tag}\``,
					'',
					'**Role name:**',
					`${newRole}`,
					'',
					'**Added:**',
					`\`${changes.filter(p => p.value === true)
						.map(p => p.name)
						.join('`, `') || 'Nothing'}\``,
					'',
					'**Removed:**',
					`\`${changes.filter(p => p.value === false)
						.map(p => p.name)
						.join('`, `') || 'Nothing'}\``
				].join('\n'),
				color: client.config.color
			}]
		});
	}

	if (oldRole.mentionable !== newRole.mentionable) {
		await newRole.guild.log({
			embeds: [{
				title: '**Role Updated**',
				description: [
					'**Actioned by:**',
					`\`${audit.executor.tag}\``,
					'',
					'**Role name:**',
					`${newRole}`,
					'',
					'**From:**',
					`\`${oldRole.mentionable ? 'Mentionable' : 'Not Mentionable'}\``,
					'',
					'**To:**',
					`\`${newRole.mentionable ? 'Mentionable' : 'Not Mentionable'}\``
				].join('\n'),
				color: client.config.color
			}]
		});
	}

	if (oldRole.color !== newRole.color) {
		await newRole.guild.log({
			embeds: [{
				title: '**Role Color Updated**',
				description: [
					'**Actioned by:**',
					`\`${audit.executor.tag}\``,
					'',
					'**Role name:**',
					`${newRole}`,
					'',
					'**From:**',
					`\`${oldRole.hexColor}\``,
					'',
					'**To:**',
					`\`${newRole.hexColor}\``
				].join('\n'),
				color: client.config.color
			}]
		});
	}

	if (oldRole.name !== newRole.name) {
		await newRole.guild.log({
			embeds: [{
				title: '**Role Name Updated**',
				description: [
					'**Actioned by:**',
					`\`${audit.executor.tag}\``,
					'',
					'**Role name:**',
					`${newRole}`,
					'',
					'**From:**',
					`\`${oldRole.name}\``,
					'',
					'**To:**',
					`\`${newRole.name}\``
				].join('\n'),
				color: client.config.color
			}]
		});
	}
};
