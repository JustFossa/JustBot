const { Client, Intents, Collection } = require('discord.js');
const {token} = require("./config.json")
const fs = require('fs')
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
require('dotenv').config()

const client = new Client({ intents: [Intents.FLAGS.GUILDS] })

client.commands = new Collection()
const eventFiles = fs.readdirSync("./events").filter(file => file.endsWith('.js'))



client.on('ready', () => {
  

	console.log(`Ready! Logged in as: ${client.user.tag}`);
    const commands = [];
    const commandFolders = fs.readdirSync("./commands");

    for (folder of commandFolders) {
      const commandFiles = fs.readdirSync(`./commands/${folder}`).filter((file) => file.endsWith(".js"));

      for (file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
    
     client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
      }
    }

    const clientId = "902251614923005953";
    const guildId = "901883411663314954";

    const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);

    (async () => {
      try {
        console.log("Started refreshing application (/) commands.");

        await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
          body: commands,
        });

        console.log("Successfully reloaded application (/) commands.");
      } catch (error) {
        console.error(error);
      }
    })();

})

client.on('interactionCreate', async interaction => {
	if(!interaction.isCommand()) {
		return
	} else {
		const command = client.commands.get(interaction.commandName)

		if(!command) return
		
		try {
			await command.execute(interaction, client)
		} catch (err) {
			console.log(err)
		}
	}
})

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}


client.login(process.env.TOKEN);