const { Client, Intents, Collection } = require('discord.js');
const fs = require('fs')
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
require('dotenv').config()
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS,
Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES,
Intents.FLAGS.GUILD_VOICE_STATES] 
})
const languageHelper = require("./helpers/languages");


client.commands = new Collection()
client.aliasses = new Collection()
client.legacyCommands = new Collection()
client.usages = new Collection()
module.exports.client = client
const eventFiles = fs.readdirSync("./events").filter(file => file.endsWith('.js'))



client.on('ready', () => {
  

	console.log(`[INFO]: Ready! Logged in as: ${client.user.tag}`);
    const commands = [];
    const commandFolders = fs.readdirSync("./commands");

    for (folder of commandFolders) {
      const commandFiles = fs.readdirSync(`./commands/${folder}`).filter((file) => file.endsWith(".js"));

      for (file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
    
     client.commands.set(command.data.name, command);
console.log(`[COMMANDS]: Loaded: `+ command.data.name);    commands.push(command.data.toJSON());
      }
    }


	// ################ LEGACY COMMANDS ###################
    const legacycommandFolders = fs.readdirSync("./legacy-commands");

    for (folder of legacycommandFolders) {
      const legacycommandFiles = fs.readdirSync(`./legacy-commands/${folder}`).filter((file) => file.endsWith(".js"));

      for (file of legacycommandFiles) {
   var fileGet = require(`./legacy-commands/${folder}/${file}`)
				console.log(`[LEGACY COMMANDS]: Loaded: ${file} `)

				try{
					client.legacyCommands.set(fileGet.help.name, fileGet)

fileGet.help.aliasses.forEach(alias => {

	client.aliasses.set(alias, fileGet.help.name)
})
			} catch (err) {
					console.log(err)
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

  

}
})


for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	} else {
		client.on(event.name, (...args) => event.execute(...args, client));
	}
}

client.on("messageCreate",async message => {
	 if(message.author.bot) return
  
	const prefix = '!'
	const messageArray = message.content.split(" ")
	let cmd = messageArray[0]
	let args = messageArray.slice[1]

	let commands = client.legacyCommands.get(cmd.slice(prefix.length)) || client.legacyCommands.get(client.aliasses.get(cmd.slice(prefix.length)))
	if(commands) {
	if(!message.content.startsWith(prefix)) return
				commands.run(client, message, args, prefix)
	}	
})



client.login(process.env.TOKEN);