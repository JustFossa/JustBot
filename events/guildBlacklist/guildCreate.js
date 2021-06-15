const blacklists = require('../../models/blacklist');

module.exports = async (client, guild) => {
	const user = await blacklists.findOne({ userID: guild.ownerID });
	if (user && user.active) await guild.leave();
	if (await client.utils.guildBlacklists.active(guild.id)) return guild.leave();
};
