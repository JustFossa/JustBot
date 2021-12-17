const { SlashCommandBuilder } = require("@discordjs/builders")
const {MessageEmbed, Permissions, MessageActionRow, MessageSelectMenu} = require("discord.js")
const rrModel = require("../../models/reactionRoles.js")
module.exports = {
    data: new SlashCommandBuilder()
        .setName("panel")
        .setDescription("Sends Panel with reaction roles"),



    async execute(interaction) {
        if(!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES, Permissions.FLAGS.MANAGE_GUILD)) {
            return interaction.reply({
                content: "You cant use that"
            })
        }

      

        
        const guildData = await rrModel.findOne({
            guildId: interaction.guild.id
        })

        if(!guildData) {
            return interaction.reply(
                "There are no roles inside this server"
            )
        }

        const options = guildData.roles.map((x) => {
            const role = interaction.guild.roles.cache.get(x.roleId)
        

        return {
            label: role.name,
            value: role.id,
            description: x.description || "No Description provided",
            emoji: x.emoji
        }

    })

    const panelEmbed = new MessageEmbed()
        .setTitle("Please select a role")
        .setColor("AQUA")

    
    const components = [
        new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId("reaction-roles")
                    .setMinValues(1)
                    .addOptions(options)
            )

    ]

await interaction.reply({
   embeds: [panelEmbed], components
   })
			

}
}