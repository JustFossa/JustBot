const { MessageEmbed } = require("discord.js")
const {SlashCommandBuilder} = require("@discordjs/builders")
const settingsModel = require("../../models/guildSettings.js")
module.exports = {
	data: new SlashCommandBuilder()
	.setName("settings")
	.setDescription("Allows you to change settings for your guild")
	.addSubcommand(command => command.setName("welcomechannel")
		.setDescription("Change / set channel to set welcome messages")	
			.addChannelOption(option => option.setName("channel")
		.setDescription("Channel to send welcome messages to")
			.setRequired(true)))
	.addSubcommand(command => command.setName("logging")
		.addBooleanOption(option => option.setName("status")
			.setDescription("Enable / Disable logging")
				.setRequired(true))),
	async execute(interaction, client) {
		const {member, options, guild} = interaction

		const subcommand = options.getSubcommand()
const data = await settingsModel.findOne({
	guildId: guild.id
})
		if(subcommand == "welcomechannel") {
			const channel = options.getChannel("channel")
			if(!data) {
				const newData =await new settingsModel({
					guildId: guild.id,
					welcoming: true,
					welcomeChannel: channel.id
				})
				newData.save()
			} else if(data) {
				await settingsModel.findOneAndUpdate({guildId: guild.id}, {
					welcoming: true,
					welcomeChannel: channel.id
				})
			}
			const embed = new MessageEmbed()
			.setTitle("Welcome settings")
			.setDescription(`**Status:** \`Enabled\`\n**Channel:** ${channel}`)
			.setColor("GREEN")
			.setTimestamp()
			
			await interaction.reply({
				embeds: [embed]
			})
		}


	}
}