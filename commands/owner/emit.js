const { SlashCommandBuilder } = require('@discordjs/builders');
const {MessageEmbed} = require("discord.js")
module.exports = {
 data: new SlashCommandBuilder()
	.setName('emit')
	.setDescription('Emits and Event!')
	.addSubcommand(command => command.setName("guildmemberadd")
	  .setDescription("Emits member join event"))
  .addSubcommand(command => command.setName("guildcreate")
    .setDescription("Emits guildCreate command")),

   async execute(interaction, client) {
   
     if(interaction.user.id !== "729224025401851915") interaction.reply({
     content: "You cant use that"
     }) 
     
     if(interaction.options.getSubcommand() === "guildmemberadd") {
			 
     client.emit("guildMemberAdd", interaction.member)
     interaction.reply({
     content: "Event: `guildMemberAdd` was emitted sucessfully"
     })
     }

     if(interaction.options.getSubcommand() === "guildcreate") {
			 
      client.emit("guildCreate", interaction.guild)
      interaction.reply({
      content: "Event: `guildCreate` was emitted sucessfully"
      })
      }
   
   }
   
   
   
}