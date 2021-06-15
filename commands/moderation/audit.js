const seperator = '▬▬▬▬▬▬▬▬▬▬';
const { Permissions } = require('discord.js');
const emojis = require('../emojis/emojis');

module.exports = {
	name: 'view-audit',
	description: 'Provides the audit logs for your server',
	usage: '',
	example: '',
	category: 'Moderation',
	aliases: ['audits', 'audit'],
	modBypass: true,
	clientPermissions: [Permissions.FLAGS.VIEW_AUDIT_LOG, Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [Permissions.FLAGS.VIEW_AUDIT_LOG],
	async execute({ message, client }) {
		const msg = await message.channel.send(client.embed('How many audit entries would you like to view?'));
		const awaited = await message.channel.awaitMessages(
			msg => msg.author.id === message.author.id,
			{ max: 1, time: 60000, errors: ['time'] }
		).catch(() => null);

		if (!awaited) {
			return msg.edit(`${emojis.cross} The command timed-out, please type the command to try again!`, { embed: null });
		}

		const m = awaited?.first();
		await m.delete();
		if (m?.content?.toLowerCase() === 'stop') {
			return msg.edit(`${emojis.tick} Command successfully terminated!`, { embed: null });
		}

		client.config.hold.add(`${message.guild.id}:message_deleted`);
		await message.delete().catch(() => client.config.hold.delete(`${message.guild.id}:message_deleted`));

		const { member, channel, guild } = message;

		const amount = Number(m.content);

		if (isNaN(amount)) return msg.edit('The specified amount is not a number!', { embed: null });

		let logs;

		try {
			logs = await guild.fetchAuditLogs({
				limit: Math.max(1, amount)
			});
		} catch (err) {
			return msg.edit('An error occured while getting the logs!', { embed: null });
		}

		const logsInfo = logs.entries.map(log => {
			let target;
			switch (log.targetType) {
				case 'GUILD':
					target = log.target.name;
					break;
				case 'CHANNEL':
					target = `#${log.target.name}`;
					break;
				case 'USER':
					target = log.target.tag;
					break;
				case 'ROLE':
					target = `@${log.target.name}`;
					break;
				case 'INVITE':
					target = `Invite: ${log.target.code}`;
					break;
				case 'WEBHOOK':
					target = `Webhook: ${log.target.name}`;
					break;
				case 'EMOJI':
					target = log.target.toString();
					break;
				case 'MESSAGE':
					target = `Message: ${log.target.id}`;
					break;
				case 'INTEGRATION':
					target = `Integration: ${log.target.id}`;
					break;
				default:
					target = 'Unknown';
					break;
			}
			return {
				action: log.action,
				reason: log.reason || 'none',
				executor: log.executor,
				target
			};
		});

		const logBody = logsInfo.map(log => `User: ${log.executor.tag}\nAction: ${log.action}\nTarget: ${log.target}\nReason: ${log.reason}`).join(`\n${seperator}\n`);

		msg.edit(`Last \`${logs.entries.size}\` audit log actions:\n\`\`\`\n${seperator}\n${logBody}\n${seperator}\n\`\`\``, { time: 30000, embed: null });
	}
};
