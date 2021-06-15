const mongoose = require('mongoose');

const LockSchema = new mongoose.Schema({
	channelID: { type: String, unique: true, required: true },
	time: { type: Date, required: true }
});

module.exports = mongoose.model('lock', LockSchema);
