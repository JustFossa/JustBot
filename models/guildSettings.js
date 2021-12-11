const mongoose = require("mongoose")
/** 
 *  Logging Struture
 *  - messageUpdate: Boolean,
 *  - messageDelete: Boolean,
 *  - memberKick: Boolean,
 *  - memberBan: Boolean,
 *  - warn: Boolean,
 *  - mute: Boolean,
 *  - ticket: Boolean
 */
const model = new mongoose.Schema({
    guildId: String,
    logging: {
        type: Boolean,
        required: true,
        default: false
    },
    loggingEvents: Array,
    logChannel: String,
    welcoming: {
        type: Boolean,
        required: true,
        default: false
    },
    welcomeChannel: String,
    muteRole: String,

})

module.exports = mongoose.model("guild", model)