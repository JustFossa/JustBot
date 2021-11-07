const {MessageEmbed} = require("discord.js")
const {SlashCommandBuilder} = require("@discordjs/builders")
module.exports = {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kicks specified member")
        .addUserOption(option => option.setName("target")
            .setDescription("The user you want to kick")
            .setRequired(true))
        .addStringOption(option => option.setName("reason")
            .setDescription("Reason you want to kick user for (optional)")
            .setRequired(false)),

        async execute(interaction, client) {
            const member = interaction.options.getUser("target")
            const reason = interaction.options.getString("reason") || "No reason provided"

            const kickEmbed = new MessageEmbed()
                .setTitle("Member Kicked")
                .setDescription(`**Member:** ${member} \n **Kicked by:** ${interaction.user} \n **Reason:** \`${reason}\``)
                .setColor("RED")
                .setTimestamp()

            const dmEmbed = new MessageEmbed()
                .setTitle("You've been kicked")
                .setDescription(`**Kicked by:** ${interaction.user} \n **Reason:** \`${reason}\` \n **Guild:** \`${interaction.guild}\``)
                .setColor("RED")
                .setTimestamp()

            await member.send({
                embeds: [dmEmbed]
            })
         member.kick({
                reason: reason
            })
            
                interaction.reply({
                    embeds: [kickEmbed]
                })
        }

}