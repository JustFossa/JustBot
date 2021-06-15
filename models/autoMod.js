const mongoose = require('mongoose');

const AutoModSchema = new mongoose.Schema({
	swearing: { type: Boolean, default: false },
	links: { type: Boolean, default: false },
	massMention: { type: Boolean, default: false },
	duplicateText: { type: Boolean, default: false },
	emojiSpam: { type: Boolean, default: false },
	massCaps: { type: Boolean, default: false }
});

module.exports = AutoModSchema;
