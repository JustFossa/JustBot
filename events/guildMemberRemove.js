const memberModel = require("../models/memberCounter.js")

module.exports = {
	name: "guildMemberRemove",
	async execute(member) {
		const data = await memberModel.findOne({
			guildId: member.guild.id
		})

		if(!data) {
			console.log('No counter set')
		} else if(data) {
			const channel = member.guild.channels.cache.get(data.channelId)
 
channel.setName(`Total Members: ${member.guild.memberCount.toLocaleString()}`)
		}
	}
}