const { SlashCommandBuilder } = require("@discordjs/builders")
 const {MessageEmbed, Permissions} = require("discord.js")
const warnSchema = require("../../models/warnSchema")

module.exports = {
     data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Allows you to warn specified member")
        .addSubcommand(command => command.setName("add")
            .setDescription("Warns user")
        .addUserOption(option => option.setName("target")
            .setDescription("The user you want to warn")
            .setRequired(true))
        .addStringOption(option => option.setName("reason")
            .setDescription("Why do you want to warn the user?")
           ))
        .addSubcommand(command => command.setName("list")
            .setDescription("Lists all user's warnings")
                .addUserOption(option => option.setName("user")
                    .setDescription("The user you want to list warns of")
                        .setRequired(true)))
        .addSubcommand(command => command.setName("info")
            .setDescription("Shows info about warning with specified id")
            .addStringOption(option => option.setName("warnid")
                .setDescription("The id of warn (Not member)")
                    .setRequired(true)))
        .addSubcommand(command => command.setName("remove")
            .setDescription("Allows you to unwarn member")
            .addUserOption(option => option.setName("member")
                .setDescription("The member to remove the warning from")
                .setRequired(true))
                    .addStringOption(option => option.setName("warn")
                        .setDescription("ID of the warn you want to remove")
                        .setRequired(true))),
                        
    async execute(interaction, client) {
        if(!interaction.member.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) {
            return interaction.reply({
                content: "You cant use that"
            })
        }

    if(interaction.options.getSubcommand() === "add") {

    
        const member = interaction.options.getMember("target")
        const reason = interaction.options.getString("reason") || "No Reason Provided!"

        const data = await warnSchema.findOne({
            guildId: interaction.guild.id,
            memberId: member.id
        })

        const warnId = makeid(15)
        const date = new Date()
 

        const newWarn = {
            warnId: warnId ,
            reason: reason,
            staff: interaction.user.id,
            member: member.id,
            timestamp: date
        }

        if(!data) {
            const newData = new warnSchema({
                guildId: interaction.guild.id,
                memberId: member.id,
                warns: newWarn
            })
            await newData.save()
        } else if(data) {
           data.warns = [...data.warns, newWarn]
           await data.save()
        }

        const embed = new MessageEmbed()
            .setTitle("Warned!")
            .setDescription(`**Member:** ${member} was warned \n> **Reason:** \`${reason}\` \n> **Warn ID:** \`${warnId}\` \n> **Staff:** ${interaction.member}`)
            .setColor("RED")
            .setTimestamp()
            .setFooter("JustBot moderation")
      await  interaction.reply({
            embeds: [embed]
        })
    }

        if (interaction.options.getSubcommand() === "list") {
            const member = interaction.options.getMember("user")
            
            var warnlist = new MessageEmbed()
                .setTitle(`${member.user.tag}'s warnings`)
                .setDescription("This is list of " + member.user.tag + "'s warnings")
                .setColor("RED")
                .setTimestamp()
                .setFooter("JustBot moderation")
            
            const data = await warnSchema.findOne({
                guildId: interaction.guild.id,
                memberId: member.id
            })
            let description = `Warnings for <@${member.id}>:\n\n`
            if(data) {
                for(warn of data.warns) {
                    let reason = warn.reason.length > 50 ? warn.reason.substr(0, 50) + "..." : warn.reason
                    
                    const id = warn.warnId
                    const date = warn.timestamp.toLocaleString()
                    const staff = `<@${warn.staff}>`
                    
                    description += `**ID:** \`${id}\`\n`
                    description += `**Reason:** \`${reason}\`\n`
                    description += `**Staff:** ${staff}\n`
                    description += `**Date:** \`${date}\`\n\n`

                }
            } else if(!data){
               description = `This member has no warnings warnings`
            }
            warnlist.setDescription(description)
            interaction.reply({
                embeds: [warnlist]
            })
        }

        if(interaction.options.getSubcommand() === "info") {
            const caseId = interaction.options.getString("warnid")

            
					const data = await warnSchema.findOne({
						guildId: interaction.guild.id,
						"warns.warnId": caseId
					})


          const warn = data.warns.filter(x => x.warnId === caseId) 

            
            if (!warn) {
                return interaction.reply({
                    content: "There is no warning with this ID!"
                })
            } else {
                const reason = warn[0].reason
                const id = warn[0].warnId
                const member = warn[0].member
                const staff = warn[0].staff
                const date = warn[0].timestamp.toLocaleString()
                const embed = new MessageEmbed()
                .setTitle("Warn info")
                .setDescription(`**Warn ID:** \`${id}\` \n**Reason:** \`${reason}\` \n**Staff:** <@${staff}> \n**Member:** <@${member}> \n**Date:** \`${date}\` `)
                .setColor("BLURPLE")
                .setFooter("JustBot moderation")

                interaction.reply({
                    embeds: [embed]
                })
            }
        }

        if(interaction.options.getSubcommand() === "remove") {
            const member = interaction.options.getMember("member")
            const caseId = interaction.options.getString("warn")

            const data = await warnSchema.findOne({
                guildId: member.guild.id,
                memberId: member.id,
            })
            const warn = data.warns.filter(x => x.warnId === caseId)
            if(warn.length < 1) {
                interaction.reply({
                    content: "There is no warning with this ID for provided member!",
                    ephemeral: true
                })
            } else {
                const filteredWarns = data.warns.filter(x => x.warnId !== caseId)
                data.warns = filteredWarns
                await data.save()
                const embed = new MessageEmbed()
                .setTitle("Warn Removed")
                .setDescription(`**Member:** <@${member.id}>\n**Removed By:** ${interaction.user}\n> **Reason of Warn:** \`${warn[0].reason}\`\n> **ID:** \`${caseId}\`\n> **Warned by:** <@${warn[0].staff}>\n> **Date:** \`${warn[0].timestamp.toLocaleString()}\``)
                .setColor("GREEN")
                .setFooter("JustBot moderation")            
            
                interaction.reply({
                    embeds: [embed]
                })
            }
        }
        
        

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