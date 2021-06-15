const Thread = require('../../models/thread');

module.exports = async (client, channel) => {
	if (channel.type === 'category') {
		const settings = await client.utils.settings.fetch(channel.guild.id);
		if (settings?.modMailSystem?.categoryID === channel.id) {
			await Thread.updateMany({ guild: channel.guild.id }, { $set: { closed: true } });
			settings.modMailSystem = null;
			await settings.save();
		}
	}

	if (!channel.guild?.me?.permissions.has('VIEW_AUDIT_LOG')) return;
	const audits = await channel.guild.fetchAuditLogs({
		limit: 1,
		type: 'CHANNEL_DELETE'
	}).catch(() => null);

	const audit = audits?.entries.first();
	if (!audit) return;

	if (channel.type === 'category') {
		return channel.guild.log({
			embeds: [{
				title: '**Category Deleted:**',
				description: [
					'**Name**',
					`\`${channel.name}\``,
					'',
					'**Actioned by:**',
					`\`${audit.executor.tag}\``
				].join('\n'),
				color: client.config.color
			}]
		}).catch(() => null);
	}

	if (['text', 'voice'].includes(channel.type)) {
		return channel.guild.log({
			embeds: [{
				title: '**Channel Delete:**',
				description: [
					'**Actioned by:**',
					`\`${audit.executor.tag}\``,
					'',
					'**Category:**',
					`\`${channel?.parent?.name ?? 'None'}\``,
					'',
					'**Channel:**',
					`\`${channel.type === 'text' ? '#' : ''}${channel.name}\``
				].join('\n'),
				color: client.config.color
			}]
		}).catch(() => null);
	}
};
