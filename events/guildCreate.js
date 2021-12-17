const {MessageEmbed} = require("discord.js")




module.exports = {
    name: "guildCreate", 
    async execute(guild, client) {
        const logChannel = client.channels.cache.get("906868226896564234")
        const EMBED_TITLE = "New guild";
        const EMBED_COLOR = "LUMINOUNS_VIVID_PINK";
        const EMBED_DESCRIPTION = `
            **Guild Name:** ${guild.name} \n
            **Guild ID:** ${guild.id}
            `;
        const embed = new MessageEmbed()
            .setTitle(EMBED_TITLE)
            .setColor(EMBED_COLOR)
            .setDescription(EMBED_DESCRIPTION)

            await logChannel.send({ 
                embeds: [embed]
            })
        }

}
