const mongoose = require('mongoose');
const warn = require('./warn.js');

const warnSchema = new mongoose.Schema({
	id: { type: String, unique: true, required: true },
	warns: { type: [warn], required: true, default: [] }
});

module.exports = mongoose.model('warn', warnSchema);
