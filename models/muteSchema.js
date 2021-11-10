
const mongoose = require("mongoose")

const muteSchema = new mongoose.Schema({
    guildId: String,
    memberId: String,
    roles: Array,
    muteTimestamp: String
})

module.exports = mongoose.model('mute', muteSchema)