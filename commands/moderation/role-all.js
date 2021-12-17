const { SlashCommandBuilder } = require("@discordjs/builders")
const {MessageEmbed, Permissions} = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("role-all")
        .setDescription("Adds specified role to all members in this server")
        .addRoleOption(option => option.setName("role")
            .setDescription("The role you want to add to members")
            .setRequired(true)),

    async execute(interaction) {
        if(!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES, Permissions.FLAGS.MANAGE_GUILD)) {
            return interaction.reply({
                content: "You cant use that"
            })
        }
        const roleint = interaction.options.getRole("role")


const members = []

await interaction.guild.members.fetch({ force: true }).then((v) => {
            v.forEach((gm) =>{
							
	if(!gm.roles.cache.has(roleint.id)) {
		
	gm.roles.add(roleint.id)
 members.push(gm)
	}		
						})})

			const embed = new MessageEmbed()
			.setTitle("Roles added")
			.setDescription(`**Role:** ${roleint}\n**Members:** \`${members.length}\``)
			.setColor("RANDOM")
			.setTimestamp()
await interaction.reply({
   embeds:[embed]
})
			

}
}