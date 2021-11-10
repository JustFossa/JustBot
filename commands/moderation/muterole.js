const {SlashCommandBuilder} = require("@discordjs/builders")
const {MessageEmbed, Permissions} = require("discord.js")
const muteRole = require("../../models/muteRole")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("muterole")
        .setDescription("Allows you to configure role to use for muted people")
        .addRoleOption(option => option.setName("role")
            .setDescription("Muted role. Make sure the role is placed below my role so i can manage it")
            .setRequired(true)),
    async execute(interaction, client) {
        const role = interaction.options.getRole("role")
        
        const data = await muteRole.findOne({
            guildId: interaction.guild.id
        })

        if(!data) {
            const newData = new muteRole({
                guildId: interaction.guild.id,
                roleId: role.id
            })
            newData.save()

        } else if(data) {
           await muteRole.findOneAndUpdate({
                guildId: interaction.guild.id
            }, {
                roleId: role.id
            })
        }

        const embed = new MessageEmbed()
            .setTitle("Mute Role")
            .setDescription(`**Role:** ${role} \n Role has been set, it will now be used when muting people`)
            .setTimestamp()
            .setColor("GREEN")
        await interaction.reply({
            embeds: [embed]
        })
    }
}