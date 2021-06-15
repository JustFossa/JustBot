const mongoose = require('mongoose');

const BlacklistSchema = new mongoose.Schema({
	userID: { type: String, unique: true, required: true },
	active: { type: Boolean, required: true, default: true }
});

module.exports = mongoose.model('blacklist', BlacklistSchema);
