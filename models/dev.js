const mongoose = require("mongoose")

const dev = new mongoose.Schema({
        guildId: {
                type: String,
                required: true
        },
        status: {
                type: Boolean,

        }
})

module.exports = mongoose.model("dev",dev)