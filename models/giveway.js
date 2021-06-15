const mongoose = require('mongoose');

const GivewaySchema = new mongoose.Schema({
	channelID: { type: String, required: true },
	messageID: { type: String, unique: true, required: true },
	winners: { type: Number, required: true },
	time: { type: Date, required: true },
	complete: { type: Boolean, required: true, default: false },
	users: {
		type: [],
		default: []
	}
}, { timestamps: true });

module.exports = mongoose.model('giveway', GivewaySchema);
