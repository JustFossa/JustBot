const mongoose = require('mongoose');

const muteSchema = new mongoose.Schema({
	guildID: {
		type: String,
		required: true
	},
	userID: {
		type: String,
		unique: true,
		required: true
	},
	timestamp: {
		type: Date,
		default: new Date(0)
	},
	muted: {
		type: Boolean,
		default: false
	}
});

module.exports = mongoose.model('mute', muteSchema);
