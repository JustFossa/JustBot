const { DiscordTogether } = require('../../utils/DiscordTogether')
const { SlashCommandBuilder } = require('@discordjs/builders')
const discordTogether = require('../../utils/DiscordTogether')



module.exports = {
    data: new SlashCommandBuilder()
    .setName("together")
    .setDescription("Starts Youtube Together activity in mentioned channel")
    .addChannelOption(option => option.setName('channel')
        .setRequired(true)
        .setDescription("Channel you want the activity to start in")),
    async execute(interaction, client) {
        const channel = interaction.options.getChannel('channel')
        const voiceChannel = interaction.guild.channels.cache.get(channel.id)
        
        console.log({ voiceChannel })

        if(voiceChannel.type !== "GUILD_VOICE") {
            return interaction.followUp({
                content: "Please select a voice channel"
            })

            
        }

        discordTogether.createTogetherCode(channel.id, "youtube").then((x) => interaction.followUp(x.code))
    }
}