const {SlashCommandBuilder} = require("@discordjs/builders")
const {MessageEmbed, Permissions} = require("discord.js")
const muteSchema = require("../../models/muteSchema")
const muteRole = require("../../models/muteRole")

module.exports = {
    data: new SlashCommandBuilder()
        .setTitle("mute")
        .setDescription("Mutes specified member")
        .addUserOption(option => option.setName("user")
            .setDescription("The member you want to mute")
            .setRequired(true))
        .addStringOption(option => option.setName("reason")
            .setDescription("The reason you want to mute the user for")
            .setRequired(false))
        .addNumberOption(option => option.setName("length")
            .setDescription("The length you want to mute the user for")),
    async execute(interaction, client) {
        const member = interaction.options.getMember("user")
        const reason = interaction.options.getString("reason") || "No reason provided"
        const length = interaction.options.getNumber("length")

        const data = await muteSchema.findOne({
            guildId: interaction.guild.id
        })

        const muteRole = await muteRole.findOne({
            guildId: interaction.guild.id,
            memberId: member.user.id
        })

    if(!muteRole) {
        await interaction.reply({
            content: "You dont have any mute role configured, please set it by using `/muterole`"
            })
    } else if(muteRole) {
            const guildRole = interaction.guild.roles.cache.get(muteRole.roleId)
        }

let userRoles = []

for(role of member.roles.cache) {
    console.log(role)
    // userRoles.push(role.id)
}

        if(!data) {
            const newData = new muteSchema({
                guildId: interaction.guild.id,
                memberId: member.user.id,
                roles: userRoles
            })
            await newData.save()
        } else if(data) {
            muteSchema.findOneAndUpdate({
                guildId: interaction.guild.id,
                memberId: member.user.id
            }, {
                memberId: member.user.id,
                roles: userRoles
            })
        }
    
        await member.roles.add(muteRole.roleId)

        const embed = new MessageEmbed()
            .setTitle("Member Muted")
            .setDescription(`**Member:** ${member} \n **Reason:** \`${reason}\``)
            .setColor("RANDOM")
            .setTimestamp()
        interaction.reply({
            embeds: [embed]
        })




    }
}