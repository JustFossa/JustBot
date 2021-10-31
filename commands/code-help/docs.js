const {SlashCommandBuilder} = require("@discordjs/builders")
const { Discord } = require("discord.js")
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = {
    data: new SlashCommandBuilder()
                .setName("docs")
                .setDescription("Sends discord.js documentation based on your query")
                        .addStringOption(option => option.setName("query")
                        .setDescription("What do you want to search in the docs?")
                        .setRequired(true)),
                async execute(interaction) {
                
                const query = interaction.options.getString("query")
                const url = `https://djsdocs.sorta.moe/v2/embed?src=stable&q=${encodeURIComponent(query)}`
                
                const docfetch = await fetch(url)
                const embed = await docfetch.json()
                
                interaction.reply({
                embeds: [embed]
                })
                }
            }