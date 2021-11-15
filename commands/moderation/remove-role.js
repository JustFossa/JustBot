const { SlashCommandBuilder } = require("@discordjs/builders")
const {MessageEmbed, Permissions, MessageActionRow, MessageSelectMenu} = require("discord.js")
const rrModel = require("../../models/reactionRoles.js")
module.exports = {
    data: new SlashCommandBuilder()
        .setName("remove-role")
        .setDescription("Remove reaction role")
		.addRoleOption(option => option.setName("role").setDescription("Role to be deleted").setRequired(true)),



    async execute(interaction) {
        if(!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES, Permissions.FLAGS.MANAGE_GUILD)) {
            return interaction.reply({
                content: "You cant use that"
            })
        }

      const role = interaction.options.getRole("role")

        
        const guildData = await rrModel.findOne({
            guildId: interaction.guild.id
        })

        const guildRoles = guildData.roles
        
        const findRole = guildRoles.find(x => x.roleId === role.id)
        if(!findRole) return interaction.reply("That roles is not added to the reaction roles list")

        if(!guildData) {
            return interaction.reply({
                content: "There are no roles inside of this server"
            })
        }

        const filteredRoles = guildRoles.filter(x => x.roleId !== role.id)
        guildData.roles = filteredRoles

        await guildData.save()

await interaction.reply({
   content: `Removed a role: ${role}`
})
			

}
}