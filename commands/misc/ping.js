const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    testOnly: true,
    async execute({ interaction, client } ) {
        await interaction.reply('Pong');
    },
};