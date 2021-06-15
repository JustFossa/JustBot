const mongoose = require('mongoose');

const categoryBlock = new mongoose.Schema({
	categoryID: { type: String, unique: true, required: true },
	active: { type: Boolean, required: true, default: true }
});

module.exports = mongoose.model('categoryBlock', categoryBlock);
