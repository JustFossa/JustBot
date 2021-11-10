const {MessageEmbed, Permissions} = require("discord.js")
const {SlashCommandBuilder} = require("@discordjs/builders")
const schema = require("../../models/memberCounter.js")
module.exports = {
    data: new SlashCommandBuilder()
        .setName("member-counter")
        .setDescription("Sets member counting channel")
        .addChannelOption(option => option.setName("channel")
            .setDescription("The user you want to kick")
            .setRequired(true)),

        async execute(interaction, client) {
					if(!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
						return interaction.reply({
							content: "You cant use that"
						})
					}
         const channel = interaction.options.getChannel("channel")
const data = await schema.findOne({
     guildId: interaction.guild.id
	
})
		
  if(!data) {
		const newData = new schema({
			guildId: interaction.guild.id,
			channelId: channel
		})
   await newData.save()
	} else if(data) {
	await	schema.findOneAndUpdate({ guildId: interaction.guild.id }, {
			channelId: channel
		})
	}

	await channel.setName(`Total Members: ${interaction.guild.memberCount} `)


					const embed = new MessageEmbed()
					.setTitle("Member Count")
					.setDescription(`**Channel:** \`${channel.id}\`\n**Members:** \`${interaction.guild.memberCount}\``)
					.setColor('RANDOM')
					.setTimestamp()

				
					
     interaction.reply({
                    embeds: [embed]
                })
        }

}