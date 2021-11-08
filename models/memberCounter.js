const mongoose = require("mongoose")

const memberCounterModel = new mongoose.Schema({
	guildId: Number,
	channelId: {
		type: String
	}
})

module.exports = mongoose.model("member-count", memberCounterModel)