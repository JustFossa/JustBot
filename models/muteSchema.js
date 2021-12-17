
const mongoose = require("mongoose")

const muteSchema = new mongoose.Schema({
    guildId: String,
    Users: Array
})

module.exports = mongoose.model('mute', muteSchema)