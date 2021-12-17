
module.exports.load = async(client) => {
    const express = require("express")
    const app = express()
    const path = require("path")
    app.get("/", (req, res) => {
        res.sendFile(path.join(__dirname + "/src/" + "index.html"))
    })
    app.listen(8050, () => {
        console.log("[DASHBOARD]: Listen on port 8050")
    })

}

