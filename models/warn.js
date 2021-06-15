const mongoose = require('mongoose');

const warnSchema = new mongoose.Schema({
	reason: { type: String, required: true },
	date: { type: Date, required: true, default: Date },
	moderator: { type: String, required: true }
});

module.exports = warnSchema;
