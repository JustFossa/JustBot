const mongoose = require("mongoose")

const muteRole = new mongoose.Schema({
    guildId: Number,
    roleId: Number
})

module.exports = mongoose.model('muteRole', muteRole)