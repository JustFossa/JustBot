const { SlashCommandBuilder } = require('@discordjs/builders');
const {MessageEmbed} = require("discord.js")
module.exports = {
 data: new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Replies with Pong!'),

   async execute(interaction, client) {
       try {
           const mesg = await interaction.reply({content:'Pinging...', fetchReply: true})

        const embed = new MessageEmbed()
                .setTitle("Pong!")
                .setDescription(`\`Client latency: ${mesg.createdTimestamp - interaction.createdTimestamp}ms \n Websocket latency: ${client.ws.ping}ms \``)
                .setTimestamp()
             
              await  interaction.editReply({
                    embeds: [embed]
                }) 
       } catch(err) {
           console.log("Something went wrong => " + err)
       }
       
    }
   
}

    