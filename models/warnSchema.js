const mongoose = require("mongoose")

/**
 * Warns structure
 *  - warnId: string
 *  - reason: string
 */

const warnSchema = new mongoose.Schema({
    _id: String,
    guildId: String,
    memberId: String,
    warns: Array,
})


module.exports = mongoose.model("warn", warnSchema)