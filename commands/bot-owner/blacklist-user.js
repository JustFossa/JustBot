module.exports = {
	name: 'blacklist-user',
	description: 'Blacklists a user from using the bot',
	usage: '<userID>',
	example: '434693228189712385',
	args: true,
	aliases: ['bu'],
	category: 'Owner Only',
	async execute({ client, message, args, utils }) {
		if (!Object.values(client.config.owners).includes(message.author.id)) return;

		client.config.hold.add(`${message.guild.id}:message_deleted`);
		await message.delete().catch(() => client.config.hold.delete(`${message.guild.id}:message_deleted`));

		const userIdMatch = args[0].match(/\d{17,19}/);
		if (!userIdMatch) return message.channel.send('Please provide valid user ID');
		const userId = userIdMatch[0];

		const user = await client.users.fetch(userId).catch(() => null);
		if (!user) return message.channel.send('User not found');

		const doc = await utils.userBlacklists.toggleActive(user.id);
		if (doc.active) {
			for (const guild of client.guilds.cache.filter(g => g.ownerID === user.id).values()) await guild.leave();
		}
		await message.channel.temp(` User successfully ${doc.active ? 'blacklisted' : 'whitelisted'}`);

		const masterLogger = client.channels.cache.get('835614920681717761');
		if (masterLogger) {
			return masterLogger.send({
				embed: {
					title: `User ${doc.active ? 'Blacklisted' : 'Whitelisted'}`,
					description: [
						'**Actioned by:**',
						`\`${message.author.tag}\``,
						'',
						'**User:**',
						`\`${user ? user.tag : userId}\``
					].join('\n'),
					color: global.config.color
				}
			});
		}
	}
};
