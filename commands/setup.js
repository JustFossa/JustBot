const { SlashCommandBuilder } = require('@discordjs/builders');

const mongo = require('../mongo');
const languageSchema = require('../schemas/language-schema');
const { setLanguage } = require('../language');
const { DEFAULT_LANGUAGE } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('You can change all settings with this command')
        .addSubcommand(subcommand =>
            subcommand
                .setName('language')
                .setDescription('Choose language for bot')
                .addStringOption(option => option.setName('language')
                    .setDescription('language that bot will use')
                    .addChoice('english', 'english')
                    .addChoice('česky', 'czech')
                    .setRequired(false))),
    async execute({ interaction, guild }) {
        if (interaction.options.getSubcommand() === 'language') {
            const targetLanguage = interaction.options.getString('language')

            setLanguage(guild, targetLanguage);

            await mongo().then(async (mongoose) => {
                try {
                    await languageSchema.findOneAndUpdate({
                        _id: guild.id
                    }, {
                        _id: guild.id,
                        language: targetLanguage
                    }, {
                        upsert: true
                    });

                    interaction.reply('Language set to: ' + targetLanguage);
                } finally {
                    mongoose.connection.close();
                };
            });
        };

    },
};