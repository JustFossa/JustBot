const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
	id: { type: Number },
	recipient: { type: String },
	channel: { type: String },
	guild: { type: String },
	dmChannel: { type: String },
	closed: { type: Boolean, default: false },
	timestamp: { type: Date },
	subscribers: { type: Array, default: [] },
	last_updated: { type: Date },
	notified: { type: Boolean, default: false },
	expires_at: { type: Date }
});

module.exports = mongoose.model('threads', Schema);
