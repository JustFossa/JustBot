const mongoose = require("mongoose")

const model = new mongoose.Schema({
    guildId: String,
    logging: {
        type: Boolean,
        required: true,
        default: false
    },
    logChannel: String,
    welcoming: {
        type: Boolean,
        required: true,
        default: false
    },
    welcomeChannel: String

})

module.exports = mongoose.model("guild", model)