const {MessageEmbed, Permissions} = require("discord.js")
const {SlashCommandBuilder} = require("@discordjs/builders")
module.exports = {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kicks specified member")
        .addUserOption(option => option.setName("target")
            .setDescription("The user you want to kick")
            .setRequired(true))
        .addStringOption(option => option.setName("reason")
            .setDescription("Reason you want to kick user for (optional)")
            .setRequired(false)),

        async execute(interaction, client) {
					if(!interaction.member.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) {
						return interaction.reply({
							content: "You cant use that"
						})
					}


            const member = interaction.options.getMember("target")
					
            const why = interaction.options.getString("reason") || "No reason provided"

					if(!member.kickable) {
	return interaction.reply({
		content: "I cannot kick this user"
	})
						
}	
					const kickEmbed = new MessageEmbed()
                .setTitle("Member Kicked")
                .setDescription(`**Member:** ${member} \n > **Kicked by:** ${interaction.user} \n > **Reason:** \`${why}\``)
                .setColor("RED")
                .setTimestamp()

            const dmEmbed = new MessageEmbed()
                .setTitle("You've been kicked")
                .setDescription(`**Kicked by:** ${interaction.user} \n > **Reason:** \`${why}\` \n > **Guild:** \`${interaction.guild}\``)
                .setColor("RED")
                .setTimestamp()

            await member.send({
                embeds: [dmEmbed]
            })

			
         await member.kick(why)
            
                interaction.reply({
                    embeds: [kickEmbed]
                })
        }

}