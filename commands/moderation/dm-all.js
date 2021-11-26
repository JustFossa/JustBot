const { SlashCommandBuilder } = require("@discordjs/builders")
const {MessageEmbed, Permissions} = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("dm-all")
        .setDescription("Sends specified message to all members")
        .addStringOption(option => option.setName("message")
            .setDescription("The Message you want to send")
            .setRequired(true)),

    async execute(interaction) {
        if(!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES, Permissions.FLAGS.MANAGE_GUILD)) {
            return interaction.reply({
                content: "You cant use that"
            })
        }
        const message = interaction.options.getString("message")


const members = []

await interaction.guild.members.fetch({ force: true }).then((v) => {

            v.forEach((gm) =>{
							try{
								if(!gm.bot) return
                gm.send(message)
 members.push(gm)
							} catch (err) {
								console.log(err)
							}
	}		
						)})

			const embed = new MessageEmbed()
			.setTitle("Message Sent")
			.setDescription(`**Message:** ${message}\n**Members:** \`${members.length}\``)
			.setColor("RANDOM")
			.setTimestamp()
await interaction.reply({
   embeds:[embed]
})
			

}
}