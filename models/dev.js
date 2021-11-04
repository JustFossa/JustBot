const mongoose = require("mongoose")

const dev = new mongoose.Schema({
        status: Boolean
})

module.exports = mongoose.model("dev",dev)