const mongoose = require("mongoose")

const warnSchema = new mongoose.Schema({
    guildId: String,
    memberId: String,
    warns: Number,
})

module.exports = mongoose.model("warn", warnSchema)