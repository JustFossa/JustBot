module.exports = {
	name: 'blacklist-guild',
	description: 'Blacklists a guild from using the bot',
	usage: '<guildID>',
	example: '578678204890349594',
	args: true,
	aliases: ['bg', 'guild-blacklist'],
	category: 'Owner Only',
	async execute({ client, message, args, utils }) {
		if (!Object.values(client.config.owners).includes(message.author.id)) return;

		client.config.hold.add(`${message.guild.id}:message_deleted`);
		await message.delete().catch(() => client.config.hold.delete(`${message.guild.id}:message_deleted`));

		const guildIdMatch = args[0].match(/\d{17,19}/);
		if (!guildIdMatch) return message.channel.send('Please provide valid guild ID');
		const guildId = guildIdMatch[0];
		const guild = client.guilds.cache.get(guildId);

		const doc = await utils.guildBlacklists.toggleActive(guildId);

		if (guild && doc.active) await guild.leave();
		await message.channel.temp(`Guild successfully ${doc.active ? 'blacklisted' : 'whitelisted'}`);

		const masterLogger = client.channels.cache.get('835614920681717761');
		if (masterLogger) {
			return masterLogger.send({
				embed: {
					title: `Guild ${doc.active ? 'Blacklisted' : 'Whitelisted'}`,
					description: [
						'**Actioned by:**',
						`\`${message.author.tag}\``,
						'',
						'**Guild:**',
						`\`${guild ? guild.name : guildId}\``
					].join('\n'),
					color: global.config.color
				}
			});
		}
	}
};
