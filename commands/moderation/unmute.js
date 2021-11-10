const {SlashCommandBuilder} = require("@discordjs/builders")
const {MessageEmbed, Permissions} = require("discord.js")
const muteRole = require("../../models/muteRole")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unmute")
        .setDescription("Unmutes specified member")
        .addUserOption(option => option.setName("user")
            .setDescription("The member you want to unmute")
            .setRequired(true)),
        
    async execute(interaction, client) {
        const member = interaction.options.getMember("user")
       

       

        const mutedRole = await muteRole.findOne({
            guildId: interaction.guild.id,
            memberId: member.user.id
        })

    if(!mutedRole) {
        return await interaction.reply({
            content: "You dont have any mute role configured, please set it by using `/muterole`"
            })
    } else if(mutedRole) {
        await member.roles.remove(mutedRole.roleId)

        const embed = new MessageEmbed()
            .setTitle("Member Unmuted")
            .setDescription(`**Member:** ${member}`)
            .setColor("RANDOM")
            .setTimestamp()
            await interaction.reply({
                embeds: [embed]
            })
        }
/*
let userRoles = []

for(role of member.roles.cache) {
  
    userRoles.push(role)
}
*/

      
    
      




    }
}