const { SlashCommandBuilder } = require("@discordjs/builders")
 const {MessageEmbed, Permissions} = require("discord.js")
const warnSchema = require("../../models/warnSchema")

module.exports = {
     data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Allows you to warn specified member")
        .addUserOption(option => option.setName("target")
            .setDescription("The user you want to warn")
            .setRequired(true))
        .addStringOption(option => option.setName("reason")
            .setDescription("Why do you want to warn the user?")
            .setRequired(true)),
    async execute(interaction, client) {
        const member = interaction.options.getMember("target")
        const reason = interaction.options.getString("reason")

        const data = await warnSchema.findOne({
            guildId: interaction.guild.id,
            memberId: member.id
        })

        if(!data) {
            const newData = new warnSchema({
                guildId: interaction.guild.id,
                memberId: member.id,
                warns: 1
            })
            newData.save()
        }
    }
 }