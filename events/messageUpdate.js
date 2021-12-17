const {MessageEmbed} = require("discord.js")

module.exports = {
  name: "messageUpdate",
 async execute(oldMessage, newMessage) {

		const count = 1950
		const Original = oldMessage.content.slice(0, count) + (oldMessage.content.length > count ? "...":" ")
		const Edited = newMessage.content.slice(0, count) + (newMessage.content.length > count ? "...":" ")

		const logEmbed = new MessageEmbed()
		.setColor("ORANGE")
		.setTitle("Message Updated")
		.setDescription(`A [message](${newMessage.url}) has been edited by ${newMessage.author} in ${newMessage.channel} \n **Original:** \`\`\`${Original}\`\`\`
**Edited:** \`\`\`${Edited}\`\`\`
`)
		if(newMessage.attachments.size > 0) {
			logEmbed.addField(`**Attachments:** `, `${newMessage.attachments.map((a) => a.url)} `, true)
		}

		const logChannel = newMessage.guild.channels.cache.get("906689429752651836")

		logChannel.send({
			embeds: [logEmbed]
		})


	}
}