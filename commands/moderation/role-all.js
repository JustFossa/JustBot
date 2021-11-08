const { SlashCommandBuilder } = require("@discordjs/builders")
const {MessageEmbed, Permissions} = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("role-all")
        .setDescription("Adds specified role to all members in this server")
        .addRoleOption(option => option.setName("role")
            .setDescription("The role you want to add to members")
            .setRequired(true)),

    async execute(interaction) {
        if(!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES, Permissions.FLAGS.MANAGE_GUILD)) {
            return interaction.reply({
                content: "You cant use that"
            })
        }
        const roleint = interaction.options.getRole("role")



        for (const member of interaction.guild.members.cache) {
            await member.roles.add(roleint)

        }
    }
}