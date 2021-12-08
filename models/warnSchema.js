const mongoose = require("mongoose")

/**
 * Warns structure
 *  - warnId: string
 *  - reason: string
 */

const warnSchema = new mongoose.Schema({
    guildId: String,
    memberId: String,
    warns: Array,
})

module.exports = mongoose.model("warn", warnSchema)