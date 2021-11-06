const{MessageEmbed} = require("discord.js")
module.exports = {
    name: "err",
    execute(err, client) {
        const channel = client.channels.cache.find(channel => channel.id == "906541111517007932")

        const errEmbed = new MessageEmbed()
            .setTitle(`Error`)
            .setDescription(`\`${err}\``)
            .setColor("RED")
            .setTimestamp()


        channel.send({ embeds: [errEmbed]})

    }
}