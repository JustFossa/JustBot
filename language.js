const mongo = require('./mongo');
const languageSchema = require('./schemas/language-schema');
const lang = require('./lang.json');
const { DEFAULT_LANGUAGE } = require('./config.json');

// { 'guildId': 'language' }
const guildLanguages = {};

const loadLanguages = async (client) => {
    await mongo().then(async (mongoose) => {
        try {
            const results = await languageSchema.find();

                for (const result of results) {
                    const { _id, language } = result;

                    if (language == DEFAULT_LANGUAGE) {
                        await languageSchema.deleteOne({ _id });
                    };

                    const guild = await client.guilds.cache.get(_id);

                    if (!guild) {
                        console.log(`Removing guild ID "${_id}" from the database`);
                        await languageSchema.deleteOne({ _id });     // await suggestionSchema.deleteOne({ guildId: guildId });
                        return;
                    };

                    guildLanguages[_id] = language;
                };
            // for (const guild of client.guilds.cache) {
            //     const guildId = guild[0];

            //     const result = await languageSchema.findOne({
            //         _id: guildId,
            //     });

            //     guildLanguages[guildId] = result ? result.language : 'english';
            // }
        } finally {
            mongoose.connection.close();
        }
    });
};

const setLanguage = (guild, language) => {
    if (language == DEFAULT_LANGUAGE) {
        delete guildLanguages[guild.id];
        return;
    };
    guildLanguages[guild.id] = language.toLowerCase();
}

const getEmbed = (guild, embed, textId) => {
    if (!lang.translations[embed][textId]) {
        throw new Error(`Unknown text ID "${textId}"`);
    };

    if (!guildLanguages[guild.id]) {
        return lang.translations[embed][textId][DEFAULT_LANGUAGE];
    };

    const selectedlanguage = guildLanguages[guild.id].toLowerCase();

    return lang.translations[embed][textId][selectedlanguage];
};

module.exports = (guild, textId) => {
    if (!lang.translations[textId]) {
        throw new Error(`Unknown text ID "${textId}"`);
    };

    const selectedlanguage = guildLanguages[guild.id].toLowerCase();

    return lang.translations[textId][selectedlanguage];
};

module.exports.loadLanguages = loadLanguages;
module.exports.setLanguage = setLanguage;
module.exports.getEmbed = getEmbed;