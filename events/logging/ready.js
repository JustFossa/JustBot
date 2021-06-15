const blacklists = require('../../models/blacklist');

module.exports = async client => {
	console.log(`${client.user.username} ready and online`);

	await client.utils.remindScheduler.init();
	await client.utils.clanLogger.init();

	// Auto-leaves a server if the owner is blacklisted
	const users = await blacklists.find({});
	for (const user of users.filter(u => u.active === true)) {
		const guild = client.guilds.cache.find(g => g.ownerID === user.userID);
		if (guild) await client.guilds.cache.get(guild.id).leave();
	}
};
