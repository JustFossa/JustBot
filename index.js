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
client.dashboard = require("./dashboard/app.js")
client.config = require("./config.js")
client.states = {}
client.knownGuilds = []
client.databaseCache = {};
client.databaseCache.users = new Collection();
client.databaseCache.guilds = new Collection();
client.databaseCache.members = new Collection();
client.databaseCache.usersReminds = new Collection(); // members with active reminds
client.databaseCache.mutedUsers = new Collection(); // members who are currently muted
client.usersData = require("./models/user")
client.languages = require("./languages/language-meta.json")
client.translations = languageHelper();
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


 
//######################## FUNCTIONS ##################################

const functions = {
  get defaultLanguage(){
		return client.languages.find((language) => language.default).name;
	},
  	// This function is used to find a user data or create it
    async findOrCreateUser({ id: userID }, isLean){
      if(this.databaseCache.users.get(userID)){
        return isLean ? this.databaseCache.users.get(userID).toJSON() : this.databaseCache.users.get(userID);
      } else {
        let userData = (isLean ? await this.usersData.findOne({ id: userID }).lean() : await this.usersData.findOne({ id: userID }));
        if(userData){
          if(!isLean) this.databaseCache.users.set(userID, userData);
          return userData;
        } else {
          userData = new this.usersData({ id: userID });
          await userData.save();
          this.databaseCache.users.set(userID, userData);
          return isLean ? userData.toJSON() : userData;
        }
      }
    },

	// This function is used to find a member data or create it
	async findOrCreateMember({ id: memberID, guildID }, isLean){
		if(this.databaseCache.members.get(`${memberID}${guildID}`)){
			return isLean ? this.databaseCache.members.get(`${memberID}${guildID}`).toJSON() : this.databaseCache.members.get(`${memberID}${guildID}`);
		} else {
			let memberData = (isLean ? await this.membersData.findOne({ guildID, id: memberID }).lean() : await this.membersData.findOne({ guildID, id: memberID }));
			if(memberData){
				if(!isLean) this.databaseCache.members.set(`${memberID}${guildID}`, memberData);
				return memberData;
			} else {
				memberData = new this.membersData({ id: memberID, guildID: guildID });
				await memberData.save();
				const guild = await this.findOrCreateGuild({ id: guildID });
				if(guild){
					guild.members.push(memberData._id);
					await guild.save();
				}
				this.databaseCache.members.set(`${memberID}${guildID}`, memberData);
				return isLean ? memberData.toJSON() : memberData;
			}
		}
	},

	// This function is used to find a guild data or create it
	async findOrCreateGuild({ id: guildID }, isLean){
		if(this.databaseCache.guilds.get(guildID)){
			return isLean ? this.databaseCache.guilds.get(guildID).toJSON() : this.databaseCache.guilds.get(guildID);
		} else {
			let guildData = (isLean ? await this.guildsData.findOne({ id: guildID }).populate("members").lean() : await this.guildsData.findOne({ id: guildID }).populate("members"));
			if(guildData){
				if(!isLean) this.databaseCache.guilds.set(guildID, guildData);
				return guildData;
			} else {
				guildData = new this.guildsData({ id: guildID });
				await guildData.save();
				this.databaseCache.guilds.set(guildID, guildData);
				return isLean ? guildData.toJSON() : guildData;
			}
		}
	},

    
	// This function is used to resolve a user from a string
	async resolveUser(search){
		let user = null;
		if(!search || typeof search !== "string") return;
		// Try ID search
		if(search.match(/^<@!?(\d+)>$/)){
			const id = search.match(/^<@!?(\d+)>$/)[1];
			user = this.users.fetch(id).catch(() => {});
			if(user) return user;
		}
		// Try username search
		if(search.match(/^!?(\w+)#(\d+)$/)){
			const username = search.match(/^!?(\w+)#(\d+)$/)[0];
			const discriminator = search.match(/^!?(\w+)#(\d+)$/)[1];
			user = this.users.find((u) => u.username === username && u.discriminator === discriminator);
			if(user) return user;
		}
		user = await this.users.fetch(search).catch(() => {});
		return user;
	},

	async resolveMember(search, guild){
		let member = null;
		if(!search || typeof search !== "string") return;
		// Try ID search
		if(search.match(/^<@!?(\d+)>$/)){
			const id = search.match(/^<@!?(\d+)>$/)[1];
			member = await guild.members.fetch(id).catch(() => {});
			if(member) return member;
		}
		// Try username search
		if(search.match(/^!?(\w+)#(\d+)$/)){
			guild = await guild.fetch();
			member = guild.members.cache.find((m) => m.user.tag === search);
			if(member) return member;
		}
		member = await guild.members.fetch(search).catch(() => {});
		return member;
	},

	async resolveRole(search, guild){
		let role = null;
		if(!search || typeof search !== "string") return;
		// Try ID search
		if(search.match(/^<@&!?(\d+)>$/)){
			const id = search.match(/^<@&!?(\d+)>$/)[1];
			role = guild.roles.cache.get(id);
			if(role) return role;
		}
		// Try name search
		role = guild.roles.cache.find((r) => search === r.name);
		if(role) return role;
		role = guild.roles.cache.get(search);
		return role;
	},

  translate(key, args, locale){
		if(!locale) locale = this.defaultLanguage;
		const language = this.translations.get(locale);
		if (!language) throw "Invalid language set in data.";
		return language(key, args);
	}
}

module.exports.client = functions

for(const key of Reflect.ownKeys(functions)) {
  client[key] = functions[key]
}

client.dashboard.load(client)

client.login(process.env.TOKEN);