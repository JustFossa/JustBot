const { SlashCommandBuilder } = require("@discordjs/builders")
 const {MessageEmbed, Permissions} = require("discord.js")
const warnSchema = require("../../models/warnSchema")

module.exports = {
     data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Allows you to warn specified member")
            .addSubcommand(command => command.setName("list")
                .setDescription("Lists all user's warnings")
                    .addUserOption(option => option.setName("user")
                        .setDescription("The user you want to list warns of"))
                            .setRequired(true))
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
        const reason = interaction.options.getString("reason") || "No Reason Provided!"

        const data = await warnSchema.findOne({
            guildId: interaction.guild.id,
            memberId: member.id
        })

        const warnId = makeid(15)

        const newWarn = {
            warnId: warnId ,
            reason: reason
        }

        if(!data) {
            const newData = await new warnSchema({
                guildId: interaction.guild.id,
                memberId: member.id,
                warns: newWarn
            })
            newData.save()
        } else if(data) {
           data.warns = [...data.warns, newWarn]
        }

        const embed = new MessageEmbed()
            .setTitle("Warn added")
            .setDescription(`**Member:** \`${member}\` was warned \n **Reason:** \`${reason}\` \n **Warn ID:** \`${warnId}\` \n **Staff:** \`${interaction.member}\``)
            .setColor("RED")
            .setTimestamp()
      await  interaction.reply({
            embeds: [embed]
        })

        if (interaction.options.getSubcommand() === "list") {
            const member = interaction.options.getMember("user")

            const warnlist = new MessageEmbed()
                .setTitle(`${member}'s warnings`)
                .setDescription("This is list of " + member + "'s warnings")
                .setColor("RED")
                .setTimestamp()
                .setFooter("JustBot moderation")
            
            const data = warnSchema.findOne({
                guildId: interaction.guild.id,
                memberId: member.id
            })

            if(data) {
                data.warns.forEach(warn => {
                    warnlist.addField({
                        name: warn.warnId,
                        value: warn.reason
                    })
                })
            } else {
                warnlist.addField({
                    name:"No warnings",
                    value: "This user haven't been warned yet"
                })
            }
        }
        interaction.reply({
            embeds: [warnlist]
        })
    }
 }

 function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}