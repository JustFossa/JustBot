const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
	user: { type: String, required: true },
	message: { type: String },
	reason: { type: String, default: '' },
	createdAt: { type: Date, default: new Date() }
});

module.exports = mongoose.model('reminders', reminderSchema);
