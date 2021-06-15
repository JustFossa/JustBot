const mongoose = require('mongoose');

const donationLog = new mongoose.Schema({
	tag: String,
	guild: String,
	channel: String
});

const clanEvents = new mongoose.Schema({
	tag: String,
	guild: String,
	channel: String
});

exports.dlSchema = mongoose.model('donationlog', donationLog);
exports.cfSchema = mongoose.model('clanEvent', clanEvents);
