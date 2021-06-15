const mongoose = require('mongoose');

const customCommandSchema = require('./customCommand');
const welcomeSchema = require('./welcome');
const autoModSchema = require('./autoMod');
const reactionRole = require('./reactionRole');
const subscriptionSchema = require('./subscriptionSchema');

const settingsSchema = new mongoose.Schema({
	guildID: {
		type: String,
		unique: true
	},
	prefix: {
		type: String
	},
	welcome: {
		type: welcomeSchema
	},
	ccommands: {
		type: [customCommandSchema],
		default: []
	},
	logChannelID: {
		type: String,
		unique: true,
		sparse: true
	},
	economyChannelID: {
		type: String,
		unique: true,
		sparse: true
	},
	webhookUrl: {
		type: String,
		unique: true,
		sparse: true
	},
	massRoleTimestamp: {
		type: Date,
		default: new Date()
	},
	modRole: {
		type: String
	},
	autoMod: {
		type: autoModSchema
	},
	reactionRoles: {
		type: [reactionRole],
		default: []
	},
	suggestionChannelID: {
		type: String
	},
	modMailSystem: {
		categoryID: { type: String }
	},
	ticketSystem: {
		categoryID: { type: String },
		channelID: { type: String },
		messageID: { type: String },
		channelMessage: { type: String },
		enabled: { type: Boolean, required: true, default: false }
	},
	subscriptions: { type: [subscriptionSchema], default: [] }
}, {
	timestamps: true
});

module.exports = mongoose.model('setting', settingsSchema);
