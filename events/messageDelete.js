const {MessageEmbed, Message} = require("discord.js")

module.exports = {
    name: "messageDelete",
    async execute(client, message) {
        

        const embed = new MessageEmbed()
            .setTitle("Message Deleted")
            .setDescription(`A message by ${message.author} in ${message.channel} \n **Content:** ${message.content}`)
            .setTimestamp()

            message.guild.channels.cache.find(channel => channel.name === 'message').send({
                embeds: [embed]
            })
            
    }
}