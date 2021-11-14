const { SlashCommandBuilder } = require('@discordjs/builders');
const {MessageEmbed} = require("discord.js")
const fs = require('fs')
module.exports = {
 data: new SlashCommandBuilder()
	.setName('help')
	.setDescription('Replies with help menu!'),

   async execute(interaction, client) {
let categories = []

		fs.readdirSync('./commands').forEach((dir) => {
			const commands = fs.readdirSync(`./commands/${dir}`).filter((file) => file.endsWith('js'))

	const cmds = commands.map((command) => {
		let file = require(`../../commands/${dir}/${command}`)
		if(!file.data.name) return "No command Name"

		let name = file.data.name

		return `\`${name}\``
	})

	 let data = new Object()

		 data = {
			 name: dir.toUpperCase(),
			 value: cmds.length === 0 ? "No command" : cmds.join(' ')
		 }	

			 categories.push(data)	
		})
	

	
        const embed = new MessageEmbed()
		 .setTitle(`Help`)
		.addFields(categories)
		 .setColor('BLURPLE')
		 .setFooter(`Use /help <command> to get detailed info about the command`)
await  interaction.reply({
                    embeds: [embed]
                }) 

    }
   
}

