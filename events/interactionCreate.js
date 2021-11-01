//this file is useless btw so we can remove it. its here just to log every interaction but i dont think you would ever want to use it
module.exports = {
	name: 'interactionCreate',
	async execute(interaction, client) {
		console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction: ${interaction.commandName}.`);

		if(!interaction.isCommand()) {
			return
		} else {
			const command = client.commands.get(interaction.commandName)
	
			if(!command) return
			
			try {
				await command.execute(interaction, client)
			} catch (err) {
				console.log(err)
			}
		}
		
	},
};