const mongoose = require("mongoose")

const banSchema = new mongoose.Schema({
    guildId: String,
    memberId: String,
    reason: String
})

module.exports = mongoose.model("banSchema", banSchema)