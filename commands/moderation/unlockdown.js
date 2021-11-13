const {MessageEmbed, Permissions} = require('discord.js');
const { Console } = require('console');
const {SlashCommandBuilder} = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
			.setName("unlockdown")
			.setDescription("Unlocks all channel"),
    async execute(interaction, client) {
        let lockPermErr = new MessageEmbed()
        .setTitle("**User Permission Error!**")
        .setDescription("**Sorry, you don't have permissions to use this! ❌**")
        
        if(!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) 
				return 	interaction.reply({
					embeds: [lockPermErr]
				})


        
interaction.guild.channels.cache.forEach(channel => {
interaction.guild.roles.cache.forEach(role => {
          channel.permissionOverwrites.edit(role, {
                    SEND_MESSAGES: true,
                    ADD_REACTIONS: true
                });
            });	
})
  
   
		
       interaction.reply({
				 content: `Done | Server Unlocked!`
			 });	
         
    }
}
