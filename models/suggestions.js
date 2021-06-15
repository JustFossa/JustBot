const mongoose = require('mongoose');

const suggestionsSchema = new mongoose.Schema({
	suggestionID: {
		type: String,
		default: false
	},
	channelID: {
		type: String,
		default: false
	},
	messageID: {
		type: String,
		default: false
	},
	name: {
		type: String,
		default: false
	},
	suggestionText: {
		type: String,
		default: false
	}
});

module.exports = mongoose.model('suggestion', suggestionsSchema);
