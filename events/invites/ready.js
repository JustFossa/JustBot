module.exports = async client => {
	const invites = client.utils.invites;
	client.guilds.cache.forEach(async guild => {
		if (guild.me?.permissions.has('MANAGE_GUILD')) {
			await guild.fetchInvites()
				.then(guildInvites => {
					invites[guild.id] = guildInvites;
				}).catch(() => null);
		}
	});
};
