const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
	ytChannelID: { type: String, required: true },
	channelID: { type: String, required: true, unique: true }
});

module.exports = SubscriptionSchema;
