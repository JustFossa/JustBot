const {MessageEmbed, Permissions} = require('discord.js');
const { Console } = require('console');
const {SlashCommandBuilder} = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
			.setName("lock")
			.setDescription("Locks this channel"),
    async execute(interaction, client) {
        let lockPermErr = new MessageEmbed()
        .setTitle("**User Permission Error!**")
        .setDescription("**Sorry, you don't have permissions to use this! ❌**")
        
        if(!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) 
				return 	interaction.reply({
					embeds: [lockPermErr]
				})


        try {
            interaction.guild.roles.cache.forEach(role => {
                interaction.channel.permissionOverwrites.edit(role, {
                    SEND_MESSAGES: false,
                    ADD_REACTIONS: false
                });
            });
        } catch (e) {
            console.log(e);
        }

       interaction.reply({
				 content: `Done | Channel Locked!`
			 });
    }
}