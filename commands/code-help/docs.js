const {SlashCommandBuilder} = require("@discordjs/builders")
const { Discord, MessageEmbed } = require("discord.js")
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = {
    data: new SlashCommandBuilder()
                .setName("docs")
                .setDescription("Sends discord.js documentation based on your query")
                        .addStringOption(option => option.setName("query")
                        .setDescription("What do you want to search in the docs?")
                        .setRequired(true)),
                async execute(interaction) {
                
                    try {
                        const query = interaction.options.getString("query")
                        const url = `https://djsdocs.sorta.moe/v2/embed?src=stable&q=${encodeURIComponent(query)}`
                        
                        const docfetch = await fetch(url)

                            let embed = await docfetch.json()

        
                        
                        
                        
                        interaction.reply({
                        embeds: [embed]
                        })


                } catch(err) {
                    const errembed = new MessageEmbed()
                    .setTitle("Interaction failed") 
                    .setDescription("Docs for this query cannot be displayed because of an error")
                    .addField('`Error: `', `\`${err}\``)
                    .setColor("RED")
                    interaction.reply({
                        embeds: [errembed]
                    })
                }
                    }
                
            }