const mongoose = require('mongoose');

const channelBlock = new mongoose.Schema({
	channelID: { type: String, unique: true, required: true },
	active: { type: Boolean, required: true, default: true }
});

module.exports = mongoose.model('channelBlock', channelBlock);
