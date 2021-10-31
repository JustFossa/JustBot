

module.exports = {
	name: 'interactionCreate',
	async execute(interaction, client) {
		console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction: ${interaction.commandName}.`);

		
	},
};