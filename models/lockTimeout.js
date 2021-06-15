const mongoose = require('mongoose');


const lockTimeoutSchema = new mongoose.Schema({
	channelID: { type: String, required: true, unique: true },
	timestamp: { type: Date, required: true }
});

module.exports = lockTimeoutSchema;
