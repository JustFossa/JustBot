module.exports = {
	name: 'guild-blacklists',
	usage: '',
	example: '',
	category: 'Owner Only',
	async execute({ client, message, utils }) {
		const { author, channel } = message;

		const Table = utils.table;

		if (!Object.values(client.config.owners).includes(author.id)) return;

		const blacklists = await utils.guildBlacklists.getAll();

		const activeBlacklists = blacklists.filter(blacklist => blacklist ? blacklist.active : false);

		if (activeBlacklists.length < 1) return message.channel.send('No active blacklists');

		const responses = utils.wrap(utils.table([
			['ID'],
			...await Promise.all(activeBlacklists.map(async blacklist => [blacklist.guildID]))
		]), 1992);

		responses.map(response => message.channel.send(`\`\`\`\n${response}\n\`\`\``));
	}
};
