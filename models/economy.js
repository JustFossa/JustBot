const mongoose = require('mongoose');

const economySchema = new mongoose.Schema({
	userID: { type: String, unique: true },
	balance: Number,
	cash: Number,
	cooldowns: {
		WORK: Number,
		ROB: Number,
		ROLL: Number,
		TRANSFER: Number,
		WEEKLY: Number,
		BEG: Number,
		COLLECT: Number,
		CRIME: Number,
		DALILY: Number,
		GAMBLE: Number,
		MONTHLY: Number
	}
});

module.exports = mongoose.model('economyBalance', economySchema);
