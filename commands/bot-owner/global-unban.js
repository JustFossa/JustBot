const servers = [
	'693442602774823023', // Brawlcord
	'490966973899997184', // Brotherhood
	'681174156905283807', // Aeo
	'676894371085287474', // Clash of events
	'610041661179035648' // BH Alliance
];

const guilds = [];

module.exports = {
	name: 'global-unban',
	description: 'Global unbans the user from the listed guilds on the repo',
	usage: '<userID>',
	example: '434693228189712385',
	aliases: ['gunban'],
	category: 'Owner Only',
	args: true,
	async execute({ client, message, args, config }) {
		client.config.hold.add(`${message.guild.id}:message_deleted`);
		await message.delete().catch(() => client.config.hold.delete(`${message.guild.id}:message_deleted`));

		if (!Object.values(config.owners).includes(message.author.id)) return;

		const userIdMatch = args[0].match(/\d+/);
		if (!userIdMatch) return message.channel.temp('No user provided!');
		const userId = userIdMatch[0];

		const user = await client.users.fetch(userId).catch(() => null);
		if (!user) return message.channel.temp('This user was not found!');

		for (const id of servers) {
			if (!client.guilds.cache.has(id)) continue;
			guilds.push(client.guilds.cache.get(id));
		}

		const reason = args.splice(1).join(' ');
		await Promise.all(guilds.map(guild => guild.members.unban(userId, { reason }))).catch(() => null);
		await message.channel.temp(`<:ban:799375370914234388> **${user.username}** successfully unbanned in:\n\n**- ${guilds.map(guild => guild.name).join('\n- ')}**`, { time: 3000 });

		const masterLogger = client.channels.cache.get('830590930004213760');
		if (masterLogger) {
			return masterLogger.send({
				embed: {
					title: 'Global Unban',
					description: [
						'**Actioned by:**',
						`\`${message.author.tag}\``,
						'',
						'**User:**',
						`\`${user.tag || userId}\``
					].join('\n'),
					color: global.config.color
				}
			});
		}
	}
};
