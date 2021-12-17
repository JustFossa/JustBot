const {SlashCommandBuilder} = require("@discordjs/builders")
const { Discord, MessageEmbed } = require("discord.js")
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const axios = require("axios")
module.exports = {
    data: new SlashCommandBuilder()
                .setName("docs")
                .setDescription("Sends discord.js documentation based on your query")
                        .addStringOption(option => option.setName("query")
                        .setDescription("What do you want to search in the docs?")
                        .setRequired(true)),
                async execute(interaction) {
                
                    
                        const query = interaction.options.getString("query")
                        const { data } = await axios.get(
                            `https://djsdocs.sorta.moe/v2/embed?src=stable&q=${query}`
                          );

                        const chunkStringArr = (arr, maxLength, additional) => {
                            let length = 0;
                            let i = 0;
                            const chunks = [];
                          
                            for (const e of arr) {
                              if (e.length + length + additional <= maxLength) {
                                if (!chunks[i]) chunks[i] = [];
                                chunks[i].push(e);
                                length += e.length + additional;
                                continue;
                              }
                          
                              i++;
                              length = e.length;
                              chunks[i] = [e];
                            }
                          
                            return chunks;
                          };

                          const embed = new MessageEmbed(data);
                      
                          for (const [i, field] of embed.fields.entries()) {
                            const parts = field.value.split(/\s/g);
                            const chunked = chunkStringArr(parts, 1024, 1);
                            const fields = chunked.map((x) => ({
                              name: field.name,
                              value: x.join(" "),
                              inline: field.inline
                            }));
                            embed.spliceFields(i, 1, fields);
                          }
                      
                          interaction.reply({ embeds: [embed] });
                        }
                    }
            
            