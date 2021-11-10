const mongoose = require("mongoose")

const muteRole = new mongoose.Schema({
    guildId: String,
    roleId: String
})

module.exports = mongoose.model('muteRole', muteRole)