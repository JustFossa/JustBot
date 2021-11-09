const {SlashCommandBuilder} = require("@discordjs/builders")
const {MessageEmbed, Permission} = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
	    .setName("clear")
	    .setDescription("Deletes specified amount of messages")
      .addNumberOption(option => option.setName("amount")
				   .setDescription("Amount of messages to delete")
					 .setRequired(true))
	    .addUserOption(option => option.setName("target")
						.setDescription("Select a target to clear their messages")),
	async execute(interaction, client) {
		const {channel, options} = interaction

		const Amount = options.getNumber("amount")
		const target = options.getMember("target")

		const Messages = await channel.messages.fetch()

		const Response = new MessageEmbed()
		.setColor("LUMINOUS_VIVID_PINK")

		if(target) {
			let i = 0
			const filtered = []
			await Messages.filter((m) => {
				if(m.author.id == target.id && Amount > i) {
					filtered.push(m)
					i++
				}
			})

			await channel.bulkDelete(filtered, true).then(messages => {
				Response.setDescription(`🧹 Cleared \`${messages.size}\` messages from ${target}.`)
				interaction.reply({
					embeds: [Response]
				})
			})
		} else {
			await channel.bulkDelete(Amount, true).then(messages => {
				Response.setDescription(`🧹 Cleared \`${messages.size}\` messages from this channel`)
				interaction.reply({
					embeds: [Response]
				})
			})
		}
	}
	
}