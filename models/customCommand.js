const mongoose = require('mongoose');

const customCommandSchema = new mongoose.Schema({
	name: {
		type: String,
		require: true
	},
	response: {
		type: String,
		require: true
	}
});

module.exports = customCommandSchema;
