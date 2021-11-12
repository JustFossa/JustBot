const {MessageEmbed, Permissions} = require('discord.js');
const { Console } = require('console');
const {SlashCommandBuilder} = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
			.setName("lockdown")
			.setDescription("Locks all channel"),
    async execute(interaction, client) {
        let lockPermErr = new MessageEmbed()
        .setTitle("**User Permission Error!**")
        .setDescription("**Sorry, you don't have permissions to use this! ❌**")
        
        if(!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) 
				return 	interaction.reply({
					embeds: [lockPermErr]
				})


    
for(const channel of interaction.guild.channels.cache) {
  interaction.guild.roles.cache.forEach(role => {
          channel.permissionOverwrites.edit(role, {
                    SEND_MESSAGES: false,
                    ADD_REACTIONS: false
                });
            });
   
		}
       interaction.reply({
				 content: `Done | Channel Locked!`
			 });	
         
    }
}
