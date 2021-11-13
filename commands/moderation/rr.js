const { SlashCommandBuilder } = require("@discordjs/builders")
const {MessageEmbed, Permissions, MessageActionRow, MessageSelectMenu} = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("reaction-role")
        .setDescription("Reaction Roles"),

    async execute(interaction) {
        if(!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES, Permissions.FLAGS.MANAGE_GUILD)) {
            return interaction.reply({
                content: "You cant use that"
            })
        }

        const row = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId('select')
					.setPlaceholder('Nothing selected')
					.addOptions([
						{
							label: 'Select me',
							description: 'This is a description',
							value: 'first_option',
						},
						{
							label: 'You can select me too',
							description: 'This is also a description',
							value: 'second_option',
						},
					]),
			);

await interaction.reply({
   content: "Haha", components: [row]
})
			

}
}