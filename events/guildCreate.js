const {MessageEmbed} = require("discord.js")


module.exports = {
    name: "guildCreate", 
    async execute(guild, client) {
        const logChannel = client.channels.cache.get("906868226896564234")

        const embed = new MessageEmbed()
            .setTitle("New guild")
            .setColor("LUMINOUS_VIVID_PINK")
            .setDescription(`
            **Guild Name:** ${guild.name} \n
            **Guild ID:** ${guild.id}
            `)

            await logChannel.send({ 
                embeds: [embed]
            })
        }

}