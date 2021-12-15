const {SlashCommandBuilder, channelMention} = require('@discordjs/builders')
const {MessageEmbed} = require("discord.js")
module.exports = {
    data: new SlashCommandBuilder()
        .setName("music")
        .setDescription("This includes full music system")
        .addSubcommand(command => command.setName("play")
            .setDescription("Play a song")
            .addStringOption(option => option.setName("query")
                .setDescription("Provide name or url of the song to play")
                    .setRequired(true)))
        .addSubcommand(command => command.setName("volume")
            .setDescription("Adjust the volume")
            .addNumberOption(option => option.setName("percent")
                    .setDescription("10 = 10%")
                        .setRequired(true)))
        .addSubcommand(command => command.setName("options")
            .setDescription("Select an option to configure")
                .addStringOption(option => option.setName("option")
                    .setDescription("Select an option")
                    .addChoice("queue", "queue")
                    .addChoice("skip", "skip")
                    .addChoice("pause", "pause")
                    .addChoice("resume", "resume")
                    .addChoice("stop", "stop")

                
                    .setRequired(true))),

async execute(interaction, client) {
    const {options, member, guild, channel} = interaction
    const voiceChannel = member.voice.channel

    if(!voiceChannel) {
        return interaction.reply({
            content: "You must be in voice channel to be able to use this command",
            ephemeral: true
        })
    }

    if(guild.me.voice.channelId && voiceChannel.id !== guild.me.voice.channelId) {
        return interaction.reply({
            content: "I am already playing in another channel",
            ephemeral: true
        })
    }

    try {


        switch(options.getSubcommand()) {
            case "play" : {
                client.disTube.playVoiceChannel(voiceChannel, options.getString("query"), {textChannel: channel, member: member})
                return interaction.reply({
                    content: "🎵 Request received"
                })
            }
            case "volume" : {
                const volume = options.getNumber("percent")
                if(volume > 100 || volume < 1) {
                    return interaction.reply({
                        content: "You have to specify a number between 1 and 100"
                    })
                }

                client.disTube.setVolume(voiceChannel, volume)
                return interaction.reply({
                    content: `🔊 Volume has been set to \`${volume}%\``
                })
            }

            case "options" : {
                const queue = await client.disTube.getQueue(voiceChannel)

                if(!queue) {
                    return interaction.reply({
                        content: "⛔ There is no queue"
                    })
                }

                switch(options.getString("option")) {
                    case "skip" : {
                        await queue.skip(voiceChannel)
                        return interaction.reply({
                            content: "⏭ song has been skipped"
                        })
                    }

                    case "stop": {
                        await queue.stop(voiceChannel)
                        return interaction.reply({
                            content: "⏹ Music has been stopped"
                        })
                    }

                    case "pause" : {
                        await queue.pause(voiceChannel)
                        return interaction.reply({
                            content: "⏸ Song has been paused"
                        })
                    }

                    case "resume" : {
                        await queue.resume(voiceChannel)
                        return interaction.reply({
                            content: "⏯ song has been resumed"
                        })
                    }

                    case "queue": {
                        return interaction.reply({embeds:[
                            new MessageEmbed()
                            .setColor("PURPLE")
                            .setDescription(`${queue.songs.map(
                                (song, id) => `\n**${id + 1}**. ${song.name} - \`${song.formattedDuration}\``)}`)
                        ]})
                    }
                }
                return
            }
        }







    } catch(err) {
        console.log(err)
    }
}}