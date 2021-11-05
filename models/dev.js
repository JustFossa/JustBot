const mongoose = require("mongoose")

const dev = new mongoose.Schema({
	      _id: Number,
        status: String
})

module.exports = mongoose.model("devModel",dev)