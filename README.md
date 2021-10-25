# Discord.js v13 template
Basic discord bot template that supports slash commands, events and translations.
## Installation
Discord.js v13 requires [Node.js](https://nodejs.org/) v16.6.0+ to run.

Install the dependencies.
```sh
npm install
```

Create `.env` file in root directory.
```env
TOKEN=  // Bot token
CLIENT_ID=  // Bot client id
GUILD_ID=   // Test guild id
MONGO_PATH=mongodb://localhost:27017 // Path to mongo db.
```

Run the bot:
```sh
node index.js
```

## Creating new command
Create new .js file in `/commands/(optional more folders)` folder.
```js
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping') //Command name
        .setDescription('Replies with Pong!'), //Command description
    testOnly: true, // If true, slash command will be added only to the test guild.
    async execute({ interaction, guild, member, user, channel, client } ) {
        await interaction.reply('Pong!');
    },
};
```
**Note:** This command template using `SlashCommandBuilder` from `@discordjs/builders` and you can use all functions from this builder. For example: subcommands, options etc.
### Deploying commands
When you added a new command to the bot or changed existing command properties, you must register it.
```sh
node deploy-commands.js
```

## Translating commands
On top of your command add this line:
```js
const language = require('../language');
```
Next if you want to get translation use:
```js
language(guild, "TRANSLATE_NAME");
```
If you are creating embed, recommended is to use:
```js
language.getEmbed(guild, "EMBED_NAME", "TRANSLATE_NAME");
```

### Adding new translation
- Open lang.json file.
- In `translations` object add new element:
```json
"translations": {
    "TRANSLATE_NAME": {
        "english": "Translate name",
        "polish": "Nazwa tłumaczenia",
        [...]
    },
    [...]
}
```
- If you want to add translation for embed:
```json
"translations": {
    "EMBED_NAME": {
        "TRANSLATE_NAME": {
            "english": "Translate name",
            "polish": "Nazwa tłumaczenia",
            [...]
        },
        [...]
    },
    [...]
}
```

### Adding new languages
- Open `lang.json` file.
- In `languages` object add new element:
```json
"languages": [
        "english",
        "polish",
        "your_language"
    ],
```
- Open `/commands/setup.js` file.
- Add new choice to `language` subcommand:
```js
.addSubcommand(subcommand =>
            subcommand
                .setName('language')
                .setDescription('Choose language for bot')
                .addStringOption(option => option.setName('language')
                    .setDescription('language that bot will use')
                    .addChoice('english', 'english')
                    .addChoice('polski', 'polish')
                    .addChoice('Language name displayed to user', 'your_language')
                    [...]
                    .setRequired(true))),
```
- Now [deploy commands](#deploying-commands).

## Config.json file
```json
{
    "DEFAULT_LANGUAGE": "english" // Defalut bot language.
}
```


Feel free to report bugs and contribute!
