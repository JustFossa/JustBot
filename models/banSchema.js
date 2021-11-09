const mongoose = require("mongoose")

const banSchema = new mongoose.Schema({
    guildId: Number,
    memberId: Number,
    reason: String
})

module.exports = mongoose.model("banSchema", banSchema)