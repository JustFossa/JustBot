const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Client, Intents } = require("discord.js")
const os = require("os")
const moment = require("moment")
const {utc} = require("moment")

module.exports = {
    
 data: new SlashCommandBuilder()
	.setName('botinfo')
	.setDescription('Replies with Bot info!'),

   async execute(interaction, client) {

    const core = os.cpus()[0]
        const clientCreated = utc(client.user.createdTimesstamp).format("Do MMMM YYYY");
        const servers = client.guilds.cache.size.toLocaleString();
        const users = client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString();
        const channels = client.channels.cache.size.toLocaleString();
        let uptime = moment.duration(client.uptime);
            sec = uptime.seconds() == 1 ? `${uptime.seconds()} seconds` : `${uptime.seconds()} seconds`;
            min = uptime.minutes() == 1 ? `${uptime.minutes()} minutes` : `${uptime.minutes()} minutes`;
            hr = uptime.hours() == 1 ? `${uptime.hours()} hours` : `${uptime.hours()} hours`;
            days = uptime.days() == 1 ? `${uptime.days()} days` : `${uptime.days()} days`;

 
           const embed = new MessageEmbed()
                .setAuthor("Stats ðŸ“Š", client.user.displayAvatarURL())
                .setColor('#A9E9F6')
                .addFields(
                    {
                        name: 'Ping',
                        value: `\`WS Ping: ${Math.round(client.ws.ping)}ms\``
                    },
                    {
                        name: 'Server Count',
                        value: `\`${servers} servers\``,
                        inline: true,
                    },
                    {
                        name: `User Count`,
                        value: `\`${users} users\``,
                        inline: true,
                    },
                    {
                        name: 'Channel Count',
                        value: `\`${channels} channels\``
                    },
                    {
                        name: 'Bot Info',
                        value: `\`Tag: ${client.user.tag} \n ID: ${client.user.id} \n Commands: ${client.commands.size} commands \n Created on: ${clientCreated}\``,
                        inline: true,
                    },
                    {
                        name: 'CPU Info',
                        value: `\`CPU Model: ${core.model} \n CPU Cores: ${os.cpus().length} \n CPU Speed: ${core.speed / 1000} GHz\``,
                        inline: true,
                    },
                    {
                        name: 'Uptime',
                        value: `\`${days}, ${hr}, ${min} and ${sec}\``,
                        inline: true,
                    },
                )
                .setFooter(`JustBot`)
        
                interaction.reply({
                    embeds: [embed]
                })
    }
    }
