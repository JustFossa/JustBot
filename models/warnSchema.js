const mongoose = require("mongoose")

/**
 * Warns structure
 *  - warnId: string
 *  - reason: string
 *  - staff: string
 *  - member: string
 *  - timestamp: Date
 */

const warnSchema = new mongoose.Schema({
    guildId: String,
    memberId: String,
    warns: Array,
})


module.exports = mongoose.model("warn", warnSchema)