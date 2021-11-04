const { SlashCommandBuilder } = require('@discordjs/builders');
const {MessageEmbed} = require("discord.js")
module.exports = {
 data: new SlashCommandBuilder()
	.setName('emit')
	.setDescription('Emits and Event!')
	.addSubcommand(command => command.setName("guild MemberAdd")
	.setDescription("Emits member join event"))

   async execute(interaction, client) {
   
     if(!interaction.member.id == "729224025401851915") interaction.reply({
     content: "You cant use that"
     }) 
     
     if(interaction.options.getSubommand() == "guildMemberAdd") {
     client.emit("guildMemberAdd", interaction.member)
     }
   
   }
   
   
   
}