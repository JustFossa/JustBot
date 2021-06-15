const { stripIndents } = require('common-tags');
const { MessageEmbed } = require('discord.js');
const Thread = require('../../models/thread');
const { botGrowth } = require('../../models/Usage');

function getISODate() {
	const currentTime = new Date();
	currentTime.setUTCHours(0, 0, 0, 0);
	return currentTime.toISOString();
}

module.exports = async (client, guild) => {
	if (!guild.available) return;
	await botGrowth.updateOne({ timestamp: getISODate() }, { $inc: { deletion: 1, addition: 0 } }, { upsert: true });

	const settings = await client.utils.settings.fetch(guild.id);
	if (settings?.modMailSystem?.categoryID) {
		await Thread.updateMany({ guild: guild.id }, { $set: { closed: true } });
		settings.modMailSystem = null;
		await settings.save();
	}

	const user = await client.users.fetch(guild.ownerID).catch(() => null);
	const embed = new MessageEmbed()
		.setColor(global.color)
		.setDescription(stripIndents`<:list:717436253402038274> Name:
            \`${guild.name}\`

            <:profile:717437038646788137> Owner:
            \`${user ? user.tag : 'Unknown'}\`

            <:tag:717436253649502250> Owner ID:
            \`${user.id}\`

            <:tag:717436253649502250> Server ID:
            \`${guild.id}\`

            <:members:717436253364289667> Total Members:
            \`${guild.memberCount}\`
            `);
	const channel = client.channels.cache.get('703583117348307054');

	console.log(`[GUILD REMOVED] (${guild.id}) | ${guild.name}`);
	return channel?.send('<:leave:728698719742197860> **I left a guild!**', { embed });
};
