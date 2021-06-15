const { stripIndents } = require('common-tags');
const Discord = require('discord.js');
const config = require('../../config');
const { botGrowth } = require('../../models/Usage');

function getISODate() {
	const currentTime = new Date();
	currentTime.setUTCHours(0, 0, 0, 0);
	return currentTime.toISOString();
}

// prevents discontinuity of the server growth graph
setTimeout(async () => {
	await botGrowth.updateOne({ timestamp: getISODate() }, { $inc: { addition: 0, deletion: 0 } }, { upsert: true });
}, 6 * 60 * 60 * 1000);

module.exports = async (client, guild) => {
	if (!guild.available) return;
	await botGrowth.updateOne({ timestamp: getISODate() }, { $inc: { addition: 1, deletion: 0 } }, { upsert: true });

	const settingsManager = client.utils.settings;
	const settings = await settingsManager.fetch(guild.id);
	const prefix = settings.prefix || config.prefix;

	const systemChannel = guild.channels.cache.filter(ch => ch.type === 'text').first();
	const helpEmbed = new Discord.MessageEmbed();

	helpEmbed
		.setColor(global.config.color)
		.setImage('https://cdn.discordapp.com/attachments/830590930004213760/853684726002352138/1_Rgcubeti6JDVTwMPhcqBCQ.png')
		.setDescription([
			'**Hey there, thanks for inviting me!** :wave:',
			'',
			`Prefix: **\`${settings.prefix || client.config.prefix}\`**`,
			`Commands: **\`${client.commands.size}\`**`,
			'',
			'	🌐**Help & Support**',
			'• **[Features]()**',
			'• **[Documentation](https://docs.Aeo.com)**',
			'• **[Support Server](https://Aeo.com/support)**',
			'',
			'',
			'	💠**Other Links**',
			'• **[Dashboard](https://Aeo.com/dashboard)**',
			'• **[Invite Aeo](https://Aeo.xyz/invite)**',
			'',
			'**Have a great day!**'
		]);

	if (systemChannel?.permissionsFor(client.user).has(['EMBED_LINKS', 'SEND_MESSAGES'])) {
		await systemChannel.send({ embed: helpEmbed });
	}

	const user = await client.users.fetch(guild.ownerID).catch(() => null);
	const embed = new Discord.MessageEmbed()
		.setColor(client.config.color)
		.setDescription(stripIndents`
            Name:
            \`${guild.name}\`

            Owner:
            \`${user ? user.tag : 'Unknown'}\`

            Owner ID:
            \`${user.id}\`

            Server ID:
            \`${guild.id}\`

            Total Members:
            \`${guild.memberCount}\`
        `);
	const channel = client.channels.cache.get('458697028567923567'); // Admins Channel

	console.log(`[NEW GUILD ADDED] (${guild.id}) | ${guild.name}`);
	return channel?.send('**I joined a new guild!**', { embed });
};
