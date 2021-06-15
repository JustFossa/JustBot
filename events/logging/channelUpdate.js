const ms = require('ms');
const FastSet = require('@non-hacker/collections/fast-set');

function slowmodeChange(channel, actionedBy) {
	return channel.guild.log({
		embeds: [{
			title: '**Slowmode:**',
			description: '**Actioned by:**\n' +
				`\`${actionedBy.tag}\`\n\n` +
				'**Channel:**\n' +
				`${channel}\n\n` +
				'**Time:**\n' +
				`\`${ms(channel.rateLimitPerUser * 1000)}\``,
			color: global.config.color
		}]
	}).catch(() => null);
}

// eslint-disable-next-line no-unused-vars
function difference(arr) {
	return value => !arr.include(value);
}

function symDiff(arr1, arr2) {
	return arr1.filter(x => !arr2.includes(x)).concat(arr2.filter(x => !arr1.includes(x)));
}

module.exports = async (client, oldChannel, newChannel) => {
	if (!newChannel) return;
	if (newChannel.type === 'dm') return;

	if (!newChannel.guild.me.permissions.has('VIEW_AUDIT_LOG')) return;

	if (newChannel.type === 'text') {
		const audits = await newChannel.guild.fetchAuditLogs({
			type: 'CHANNEL_UPDATE',
			limit: 1
		}).catch(() => null);

		const audit = audits?.entries.first();

		if (oldChannel.name !== newChannel.name) {
			newChannel.guild.log({
				embeds: [{
					title: 'Channel Name Changed',
					description: [
						'**Actioned by:**',
						`\`${audit ? audit.executor.tag : 'Unknown'}\``,
						'',
						'**Old name:**',
						`\`${oldChannel.name}\``,
						'',
						'**New name:**',
						`\`${newChannel.name}\``
					].join('\n'),
					color: global.color
				}]
			});
		}

		if (oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) {
			if (audit.changes.some(c => c.key === 'rate_limit_per_user')) {
				slowmodeChange(newChannel, audit.executor);
			}
		}

		if (oldChannel.nsfw !== newChannel.nsfw) {
			newChannel.guild.log({
				embeds: [{
					title: 'Channel NSFW Updated',
					description: [
						'**Actioned by:**',
						`\`${audit ? audit.executor.tag : 'Unknown'}\``,
						'',
						'**From:**',
						`\`${oldChannel.nsfw ? 'NSFW' : 'No NSFW'}\``,
						'',
						'**To:**',
						`\`${newChannel.nsfw ? 'NSFW' : 'NO NSFW'}\``
					].join('\n'),
					color: global.color
				}]
			});
		}
	}

	const audits = await newChannel.guild.fetchAuditLogs({
		type: 'CHANNEL_OVERWRITE_CREATE',
		limit: 1
	}).catch(() => null);

	if (!audits) return;
	const audit = audits.entries.first();
	if (!audit) return;

	if (newChannel.type === 'text') {
		newChannel.permissionOverwrites.filter((newOverwrite, id) => {
			const oldOverwrite = oldChannel.permissionOverwrites.get(id);
			if (!oldOverwrite) return false;
			// if (!oldOverwrite && !(newOverwrite.allow.bitfield || newOverwrite.deny.bitfield)) return false;
			return oldOverwrite.allow.bitfield !== newOverwrite.allow.bitfield || oldOverwrite.deny.bitfield !== newOverwrite.deny.bitfield;
		}).each(async (newOverwrite, id) => {
			const oldOverwrite = oldChannel.permissionOverwrites.get(id);
			const permissionsChanges = new FastSet();
			permissionsChanges.addEach(symDiff(newOverwrite.allow.toArray(), oldOverwrite.allow.toArray()));
			permissionsChanges.addEach(symDiff(newOverwrite.deny.toArray(), oldOverwrite.deny.toArray()));

			if (newOverwrite.type === 'member') await newChannel.guild.members.fetch(newOverwrite.id).catch(() => null);
			await newChannel.guild.log({
				embeds: [{
					title: '**Channel Permission change:**',
					description: '**Actioned by:**\n' +
						`\`${audit.executor.tag}\`\n\n` +
						'**Channel**:\n' +
						`${newChannel}\n\n` +
						'**Action:**\n' +
						`\`${permissionsChanges.join(', ')}\`\n\n` +
						'**Target:**\n' +
						`\`${newOverwrite.type === 'member' ? newChannel.guild.members.cache.get(newOverwrite.id).user.tag : newChannel.guild.roles.cache.get(newOverwrite.id).name}\``,
					color: client.config.color
				}]
			});
		});
	}

	/* if (newChannel.type === 'category') {
		const permissionsChanges = new FastSet();
		newChannel.permissionOverwrites.filter((newOverwrite, id) => {
			const oldOverwrite = oldChannel.permissionOverwrites.get(id);
			if (!oldOverwrite) return false;
			return oldOverwrite.allow.bitfield != newOverwrite.allow.bitfield || oldOverwrite.deny.bitfield != newOverwrite.deny.bitfield;
		}).each((newOverwrite, id) => {
			const oldOverwrite = oldChannel.permissionOverwrites.get(id);
			permissionsChanges.addEach(symDiff(newOverwrite.allow.toArray(), oldOverwrite.allow.toArray()));
			permissionsChanges.addEach(symDiff(newOverwrite.deny.toArray(), oldOverwrite.deny.toArray()));
		});

		const first = newChannel.permissionOverwrites.first();
		await newChannel.guild.log({
			embeds: [{
				title: 'Category Permission Change',
				description: [
					'**Actioned by:**',
					`\`${audit.executor.tag}\``,
					'',
					'**Channel:**',
					newChannel,
					'',
					'**Action:**',
					`\`${permissionsChanges.join(' ')}\``,
					'',
					'**Target:**',
					first.type === 'role'
						? newChannel.guild.roles.cache.get(first.id)
						: newChannel.guild.members.cache.get(first.id)
				].join('\n'),
				color: client.config.color
			}]
		});
	}*/
};
