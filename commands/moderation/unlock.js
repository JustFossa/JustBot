const {MessageEmbed, Permissions} = require('discord.js');
const { Console } = require('console');
const {SlashCommandBuilder} = require("@discordjs/builders")
const muteRole = require("../../models/muteRole")

module.exports = {
    data: new SlashCommandBuilder()
			.setName("unlock")
			.setDescription("Unlock this channel"),
    async execute(interaction, client) {
        let lockPermErr = new MessageEmbed()
        .setTitle("**User Permission Error!**")
        .setDescription("**Sorry, you don't have permissions to use this! ❌**")
        
        if(!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) 
				return 	interaction.reply({
					embeds: [lockPermErr]
				})

const data = await muteRole.findOne({
	guildId: interaction.guild.id
})
        try {
            interaction.guild.roles.cache.forEach(role => {
							
 if(role.id !== data.roleId)  {
	 
       interaction.channel.permissionOverwrites.edit(role, {
                    SEND_MESSAGES: true,
                    ADD_REACTIONS: true
                });
 }
            });
        } catch (e) {
            console.log(e);
        }

       interaction.reply({
				 content: `Done | Channel unlocked!`
			 });
    }
}