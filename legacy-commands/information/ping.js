module.exports.run = async(client, message) => {
	message.reply(
		client.ws.ping + "ms"
	)
}

module.exports.help = {
	name: "ping",
	aliasses: ["p"],
	usages: "ping <test>"
}