const {MessageEmbed, Message} = require("discord.js")

module.exports = {
    name: "messageDelete",
    async execute(message, client) {
        
        const content = message.content || "None"

        const embed = new MessageEmbed()
            .setTitle("Message Deleted")
            .setDescription(`A [message](${message.url}) by ${message.author} was deleted in ${message.channel} \n > **Content:**  \`\`\`${content}\`\`\``)
					.setColor('DARK_BLUE')
            .setTimestamp()

            message.guild.channels.cache.find(channel => channel.name === 'message').send({
                embeds: [embed]
            })
            
    }
}