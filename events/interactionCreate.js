//this file is useless btw so we can remove it. its here just to log every interaction but i dont think you would ever want to use it
const devModel = require("../models/dev.js")
const wait = require("util").promisify(setTimeout)
module.exports = {
	name: 'interactionCreate',
	async execute(interaction, client) {
		const data = await devModel.findOne({
			_id: 1,
			status: true
		})


	if(!interaction.isSelectMenu())	console.log(`[INTERACTION]: ${interaction.user.tag} in #${interaction.channel.name} triggered an interaction: ${interaction.commandName}.`);

		if(!data) {
			if(interaction.isCommand()) {

			const command = client.commands.get(interaction.commandName)
	
			if(!command) return
			
			try {
				await command.execute(interaction, client)
			} catch (err) {
				console.log(err)
			}
		}
		} else if (data) {
			if(interaction.user.id !== "729224025401851915") {
				interaction.reply({
					content: `Bot is undergoing a maintanance so you cannot use commands`
				})
				
			} else {
				if(interaction.isCommand()) {
				
					const command = client.commands.get(interaction.commandName)
			
					if(!command) return
					
					try {
						await command.execute(interaction, client)
					} catch (err) {
						console.log(err)
					}
				} 
			}
		} 
		if (interaction.isSelectMenu()) {
				if(interaction.customId == "reaction-roles") {
					await interaction.deferReply({ephemeral: true})
					
					interaction.values.forEach(roleId => {
						const role = interaction.guild.roles.cache.get(roleId)

						const hasRole = interaction.member.roles.cache.has(roleId)

						if(hasRole) {
							interaction.member.roles.remove(roleId)
							interaction.editReply(`${role} has been removed from you`)
							
						} else {
							interaction.member.roles.add(roleId)
							interaction.editReply(`${role} has been assigned to you`)
							
						}
					})
					
				}
		}
		
		
	},
};