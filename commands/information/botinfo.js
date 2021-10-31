const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Client, Intents } = require("discord.js")


module.exports = {
    
 data: new SlashCommandBuilder()
	.setName('botinfo')
	.setDescription('Replies with Bot info!'),

   async execute(interaction, client) {
       const botinfo = new MessageEmbed()
            .setTitle(`${client.user.tag}'s Info'`)
            .addField(`\`ID: \``, `\`${client.user.id}\``)
            .addField(`\`Username: \``, `\`${client.user.username} \``)
            .addField(`\`Dicriminator: \``, `\`${client.user.discriminator}\``)
            .addField(`\`Websocket latency: \``, `\`${client.ws.ping} \``)

           await interaction.reply({
                embeds: [botinfo]
            })
    }
}