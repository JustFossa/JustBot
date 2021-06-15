const mongoose = require('mongoose');

const reactionRole = new mongoose.Schema({
	channelID: { type: String, required: true },
	messageID: { type: String, unique: true, required: true },
	reaction: { type: String, required: true },
	roleID: { type: String, required: true }
});

module.exports = reactionRole;
