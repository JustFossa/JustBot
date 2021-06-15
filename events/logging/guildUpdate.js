module.exports = async (client, oldGuild, newGuild) => {
	if (oldGuild === newGuild) return;
	if (!newGuild.me.permissions.has('VIEW_AUDIT_LOG')) return;

	const audits = await newGuild.fetchAuditLogs({
		type: 'GUILD_UPDATE',
		limit: 1
	}).catch(() => null);

	const audit = audits?.entries.first();
	if (!audit) return;

	if (oldGuild.icon !== newGuild.icon) {
		if (newGuild.icon) {
			newGuild.log({
				embeds: [{
					title: '**Server icon changed:**',
					color: client.config.color,
					image: {
						url: newGuild.iconURL({
							dynamic: true
						})
					},
					description: [
						'**Actioned by:**',
						`\`${audit.executor.tag}\``
					].join('\n')
				}]
			}).catch(() => null);
		} else {
			newGuild.log({
				embeds: [{
					title: '**Server icon removed**',
					color: client.config.color,
					description: [
						'**Actioned by:**',
						`\`${audit.executor.tag}\``
					].join('\n')
				}]
			}).catch(() => null);
		}
	}

	if (oldGuild.name !== newGuild.name) {
		newGuild.log({
			embeds: [{
				title: '**Server name changed:**',
				color: client.config.color,
				description: [
					'**Actioned by:**',
					`\`${audit.executor.tag}\``,
					'',
					'**Old name:**',
					`\`${oldGuild.name}\``,
					'',
					'**New name:**',
					`\`${newGuild.name}\``
				].join('\n')
			}]
		}).catch(() => null);
	}

	if (oldGuild.region !== newGuild.region) {
		newGuild.log({
			embeds: [{
				title: '**Server region changed:**',
				color: client.config.color,
				description: [
					'**Actioned by:**',
					`\`${audit.executor.tag}\``,
					'',
					'**Old region:**',
					`\`${oldGuild.region}\``,
					'',
					'**New region:**',
					`\`${newGuild.region}\``
				].join('\n')
			}]
		}).catch(() => null);
	}

	if (oldGuild.verificationLevel !== newGuild.verificationLevel) {
		newGuild.log({
			embeds: [{
				title: '**Server verification level changed:**',
				color: client.config.color,
				description: [
					'**Actioned by:**',
					`\`${audit.executor.tag}\``,
					'',
					'**Old verification level:**',
					`\`${oldGuild.verificationLevel}\``,
					'',
					'**New verification level:**',
					`\`${newGuild.verificationLevel}\``
				].join('\n')
			}]
		}).catch(() => null);
	}

	if (oldGuild.ownerID !== newGuild.ownerID) {
		const o = await client.users.fetch(oldGuild.ownerID).catch(() => null);
		const n = await client.users.fetch(newGuild.ownerID).catch(() => null);

		newGuild.log({
			embeds: [{
				title: '**Server owner changed:**',
				color: client.config.color,
				description: [
					'**Old owner:**',
					`\`${o.tag}\``,
					'',
					'**New owner:**',
					`\`${n.tag}\``
				].join('\n')
			}]
		}).catch(() => null);
	}
};
