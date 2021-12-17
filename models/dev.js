const mongoose = require("mongoose")

const dev = new mongoose.Schema({
	      _id: Number,
        status: Boolean
})

module.exports = mongoose.model("devModel",dev)