const {MessageEmbed, Permissions} = require("discord.js")
const {SlashCommandBuilder} = require("@discordjs/builders")
module.exports = {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Bans specified member")
        .addUserOption(option => option.setName("target")
            .setDescription("The user you want to ban")
            .setRequired(true))
			.addNumberOption(option => option.setName("length")
			.setDescription("Amount of days you want the user to ban for ")
			.setRequired(true))
.addStringOption(option => option.setName("reason")
            .setDescription("Reason you want to ban user for (optional)")
            .setRequired(false)),

        async execute(interaction, client) {
					if(!interaction.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
						return interaction.reply({
							content: "You cant use that"
						})
					}


            const member = interaction.options.getMember("target")

				const length = interaction.options.getNumber("length")
            const why = interaction.options.getString("reason") || "No reason provided"

					if(!member.bannable) {
	return interaction.reply({
		content: "I cannot ban this user"
	})
						
}	
					const kickEmbed = new MessageEmbed()
                .setTitle("Member Banned")
                .setDescription(`**Member:** ${member} \n **Banned by:** ${interaction.user} \n **Reason:** \`${why}\``)
                .setColor("RED")
                .setTimestamp()

            const dmEmbed = new MessageEmbed()
                .setTitle("You've been banned")
                .setDescription(`**Banned by:** ${interaction.user} \n **Reason:** \`${why}\` \n **Guild:** \`${interaction.guild}\``)
                .setColor("RED")
                .setTimestamp()

            await member.send({
                embeds: [dmEmbed]
            })

			
         await member.ban({
					 days: length, reason: why
				 })
            
                interaction.reply({
                    embeds: [kickEmbed]
                })
        }

}