const { join } = require('path');
const { readdirSync } = require('fs');
const commandFolder = join(__dirname, '../commands');

const conflict = (client, name, commandFile) => {
	if (client.commands.has(name) || client.aliases.has(name)) {
		const command = client.commands.get(name) || client.commands.get(client.aliases.get(name));
		if (command.filePath === commandFile.filePath) return;
		console.warn(`[CONFLICT]: Command '${name}' of '${commandFile.name}' already exists on '${command.name}'`);
	}
};

module.exports = async client => {
	for await (const dir of client.config.commandGroups) {
		const groupPath = join(commandFolder, dir);
		const commandFiles = readdirSync(groupPath).filter(file => file.endsWith('.js'));
		for await (const file of commandFiles) {
			let commandFile = require(join(groupPath, file));
			if (commandFile && commandFile.name && commandFile.execute) {
				commandFile = Object.assign({}, {
					aliases: [],
					filePath: `${groupPath}${file}`
				}, commandFile);

				conflict(client, commandFile.name, commandFile);
				client.commands.set(commandFile.name, commandFile);

				if (!Array.isArray(commandFile.aliases)) continue;
				for await (const alias of commandFile.aliases) {
					if (!alias) continue;
					conflict(client, alias, commandFile);
					client.aliases.set(alias, commandFile.name);
				}
			}
		}
	}
};
