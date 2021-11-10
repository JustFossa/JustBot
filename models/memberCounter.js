const mongoose = require("mongoose")

const memberCounterModel = new mongoose.Schema({
	guildId: String,
	channelId: {
		type: String
	}
})

module.exports = mongoose.model("member-count", memberCounterModel)