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
            .setRequired(true)))
        .addSubcommand(command => command.setName("list")
            .setDescription("Lists all user's warnings")
                .addUserOption(option => option.setName("user")
                    .setDescription("The user you want to list warns of")
                        .setRequired(true)))
        .addSubcommand(command => command.setName("info")
            .setDescription("Shows info about warning with specified id")
            .addStringOption(option => option.setName("warnid")
                .setDescription("The id of warn (Not member)")
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
           await data.save()
        }

        const embed = new MessageEmbed()
            .setTitle("Warn added")
            .setDescription(`**Member:** \`${member}\` was warned \n **Reason:** \`${reason}\` \n **Warn ID:** \`${warnId}\` \n **Staff:** \`${interaction.member}\``)
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

            if(data) {
                for(warn of data.warns) {
                    let reason = warn.reason.length > 50 ? warn.reason.substr(0, 50) + "..." : warn.reason
                    
                    const id = warn.warnId
                    warnlist.addField(
                        `\`${id}\``,
                        `\`${reason}\``
                    )
                }
            } else if(!data){
                warnlist.addField({
                    name:"No warnings",
                    value: "This user haven't been warned yet"
                })
            }
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

            console.log(warn)
            if (!warn) {
                return interaction.reply({
                    content: "There is no warning with this ID!"
                })
            } else {
                const reason = warn[0].reason
                const id = warn[0].warnId
                const embed = new MessageEmbed()
                .setTitle("Warn info")
                .setDescription(`**Warn ID:** \`${id}\` \n**Reason:** \`${reason}\` `)
                .setColor("BLURPLE")
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