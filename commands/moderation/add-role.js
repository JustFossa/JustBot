const { SlashCommandBuilder } = require("@discordjs/builders")
const {MessageEmbed, Permissions, MessageActionRow, MessageSelectMenu} = require("discord.js")
const rrModel = require("../../models/reactionRoles.js")
module.exports = {
    data: new SlashCommandBuilder()
        .setName("add-role")
        .setDescription("Add reaction role")
		.addRoleOption(option => option.setName("role").setDescription("Role to be assigned").setRequired(true))
		.addStringOption(option => option.setName("description").setDescription("Description of the role").setRequired(false))
		.addStringOption(option => option.setName("emoji").setDescription("Emoji for the role").setRequired(false)),


    async execute(interaction) {
        if(!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES, Permissions.FLAGS.MANAGE_GUILD)) {
            return interaction.reply({
                content: "You cant use that"
            })
        }

      const role = interaction.options.getRole("role")
	  const description = interaction.options.getString("description") || null
	  const emoji = interaction.options.getString("emoji") || null

	if(role.position >= interaction.guild.me.roles.highest.position) {
		return interaction.reply({
			content: "I cant assign tole that is higher or equal to me"
		})

	}

	let guildData = await rrModel.findOne({ guildId: interaction.guild.id })

	let newRole = {
		roleId: role.id,
		description,
		emoji
	}

	if(guildData) {
		let roleData = guildData.roles.find((x) => x.roleId === role.id)

		if(roleData) {
			roleData = newRole

		} else {
			guildData.roles = [...guildData.roles, newRole]
		}

		await guildData.save()
	} else {
		await rrModel.create({
			guildId: interaction.guild.id,
			roles: newRole
		})
	}

await interaction.reply({
   content: `Created a new role: ${role}`
})
			
}
}