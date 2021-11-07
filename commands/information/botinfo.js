const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Client, Intents } = require("discord.js")


module.exports = {
    
 data: new SlashCommandBuilder()
	.setName('botinfo')
	.setDescription('Replies with Bot info!'),

   async execute(interaction, client) {

    const promises = [
        client.shard.fetchClientValues('guilds.cache.size'),
        client.shard.broadcastEval(c => c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)),
    ];

    return Promise.all(promises)
			.then(results => {
				const totalGuilds = results[0].reduce((acc, guildCount) => acc + guildCount, 0);
				const totalMembers = results[1].reduce((acc, memberCount) => acc + memberCount, 0);
                
        days = Math.floor((client.uptime / (1000 * 60 * 60 * 24)) % 60).toString()
        hours = Math.floor((client.uptime / (1000 * 60 * 60)) % 60).toString()
        minutes = Math.floor((client.uptime / (1000 * 60)) % 60).toString()
        seconds = Math.floor((client.uptime / 1000) % 60).toString()

	const botinfo = new MessageEmbed()
            .setTitle(`${client.user.tag}'s Info'`)
            .addField(`\`ID: \``, `\`${client.user.id}\``)
            .addField(`\`Username: \``, `\`${client.user.username} \``)
            .addField(`\`Dicriminator: \``, `\`#${client.user.discriminator}\``)
            .addField(`\`Websocket latency: \``, `\`${client.ws.ping}ms \``)
            .addField(`\`Total Guilds: \` `, `\`${totalGuilds}\``)
            .addField(`\`Total Members: \` `, `\`${totalMembers}\``)
            .addField(`\`Uptime: \` `, `\`${days}d ${hours}h ${minutes}m ${seconds}s\``)
            .setTimestamp()
            

            interaction.reply({
                embeds: [botinfo]
            })
        })
    }
}