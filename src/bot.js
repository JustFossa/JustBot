const { Client, Intents, Collection } = require("discord.js")
const client = new Client({ intents: [Intents.FLAGS.GUILDS]})
const fs = require('fs')
require("dotenv").config()

client.commands = new Collection();

const functions = fs.readdirSync('./src/functions').filter(file => file.endsWith(".js"))
const eventFiles = fs.readdirSync('./src/events').filter(file => file.endsWith(".js"))
const commandsFolder = fs.readdirSync('./src/commands')


(async ( ) => {
    for (file of functions) {
        require(`./functions/${file}`)(client)
    }
    client.login(process.env.TOKEN)
})();

