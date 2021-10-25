const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const dotenv = require('dotenv');
const getAllFiles = require('./src/getAllFiles');

dotenv.config();
const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

const commands = [];
const guildCommands = [];
const globalCommands = [];
const commandFiles =  getAllFiles('./commands', '.js');

for (const file of commandFiles) {
    const command = require(file[0]);
    function Command(name, description, testOnly = true) {
        this.name = name;
        this.description = description;
        this.testOnly = testOnly;
      }
    commands.push(new Command(command.data.toJSON().name, command.data.toJSON().description, command.testOnly));

    if (command.testOnly === true || command.testOnly === undefined) {
        guildCommands.push(command.data.toJSON());
    } else {
        globalCommands.push(command.data.toJSON());
    }
};

console.table(commands);

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: guildCommands })
    .then(() => console.log('Successfully registered application guild commands.'))
    .catch(console.error);

rest.put(Routes.applicationCommands(clientId), { body: globalCommands })
    .then(() => console.log('Successfully registered application global commands.'))
    .catch(console.error);