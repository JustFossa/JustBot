const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const commandHandler = require('./commandHandler')
const dotenv = require('dotenv');

dotenv.config();

const token = process.env.TOKEN;

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

commandHandler(client, Collection);

client.login(token);