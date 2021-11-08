const {MessageEmbed, Permissions} = require("discord.js")
const {SlashCommandBuilder} = require("@discordjs/builders")
module.exports = {
    data: new SlashCommandBuilder()
        .setName("nickname")
        .setDescription("Changes nickname of specified member")
        .addUserOption(option => option.setName("target")
            .setDescription("User to change nickname")
            .setRequired(true))
        .addStringOption(option => option.setName("nickname")
            .setDescription("Nickname you want to set")
            .setRequired(true)),

        async execute(interaction, client) {
					if(!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_NICKNAMES)) {
						return interaction.reply({
							content: "You cant use that"
						})
					}


            const member = interaction.options.getMember("target")
            const nickname = interaction.options.getString("nickname")


						

			const nickEmbed = new MessageEmbed()
                .setTitle("Nickname set")
                .setDescription(`**Member:** ${member} \n > **Set to:** ${nickname}`)
                .setColor("ORANGE")
                .setTimestamp()


          
			
         await member.setNickname(nickname)
            
                interaction.reply({
                    embeds: [nickEmbed]
                })
        }

}