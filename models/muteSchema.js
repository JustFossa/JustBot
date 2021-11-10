const mongoose = require("mongoose")

const muteSchema = new mongoose.Schema({
    guildId: Number,
    memberId: Number,
    roles: Array,
    muteTimestamp: Number
})

module.exports = mongoose.model('mute', muteSchema)