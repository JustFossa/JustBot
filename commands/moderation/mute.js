const {SlashCommandBuilder} = require("@discordjs/builders")
const {MessageEmbed, Permissions} = require("discord.js")
const muteRole = require("../../models/muteRole")
const muteSchema = require("../../models/muteSchema")
module.exports = {
    data: new SlashCommandBuilder()
        .setName("mute")
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

			if(!interaction.member.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) {
						return interaction.reply({
							content: "You cant use that"
						})
					}
       

        const mutedRole = await muteRole.findOne({
            guildId: interaction.guild.id,
            memberId: member.user.id
        })

			const data = await muteSchema.findOne({
				guildId: interaction.guild.id
			})

	if(!data) {
		const newData = new muteSchema({
			guildId: interaction.guild.id,
			Users: member.user.id
		})
		newData.save()
	} else if(data) {
    await muteSchema.findOneAndUpdate({guildId:interaction.guild.id},
																{
																	$push: {
		Users: member.user.id
																	}
																}													 )
	}

    if(!mutedRole) {
        return await interaction.reply({
            content: "You dont have any mute role configured, please set it by using `/muterole`"
            })
    } else if(mutedRole) {
        await member.roles.add(mutedRole.roleId)

        const embed = new MessageEmbed()
            .setTitle("Member Muted")
            .setDescription(`**Member:** ${member} \n **Reason:** \`${reason}\``)
            .setColor("RANDOM")
            .setTimestamp()
            await interaction.reply({
                embeds: [embed]
            })
        }
 
    
      




    }
}