const { SlashCommandBuilder } = require("@discordjs/builders")
 const {MessageEmbed, Permissions} = require("discord.js")
const warnSchema = require("../../models/warnSchema")

module.exports = {
     data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Allows you to warn specified member")
        .addSubcommand(command => command.setName("list")
            .setDescription("Sends a list of target's warnings"))
        .addUserOption(option => option.setName("target")
            .setDescription("The user you want to warn")
            .setRequired(true))
        .addStringOption(option => option.setName("reason")
            .setDescription("Why do you want to warn the user?")
            .setRequired(true)),
    async execute(interaction, client) {
        if(!interaction.member.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) {
            return interaction.reply({
                content: "You cant use that"
            })
        }
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
        } else if(data) {
            warnSchema.findOneAndUpdate({guildId: interaction.guild.id, memberId: member.id}, {
                warns: data.warns + 1
            })
        }

        const embed = new MessageEmbed()
            .setTitle("Warn added")
            .setDescription(`\`Member:\` ${member} was warned \n \`Reason:\` ${reason} \n \`Staff:\` ${interaction.member}`)
            .setColor("RED")
            .setTimestamp()
      await  interaction.reply({
            embeds: [embed]
        })
    }
 }