module.exports = {
	name: 'user-blacklists',
	description: 'Provides a list of the blacklisted users',
	usage: '',
	example: '',
	category: 'Owner Only',
	async execute({ client, message, utils }) {
		const { author, channel } = message;

		const Table = utils.table;

		if (!Object.values(client.config.owners).includes(author.id)) return;

		const blacklists = await utils.userBlacklists.getAll();

		const activeBlacklists = blacklists.filter(blacklist => blacklist ? blacklist.active : false);

		if (activeBlacklists.length < 1) return message.channel.send('No active blacklists');
		const response = utils.wrap(utils.table([
			['Username', 'Tag', 'ID'],
			...await Promise.all(activeBlacklists.map(async blacklist => {
				let user;
				try {
					user = await client.users.fetch(blacklist.userID);
				} catch (err) { }

				const username = user ? user.username : 'NaN';
				const tag = user ? user.discriminator : 'NaN';

				return [username, tag, blacklist.userID];
			}))
		]), 1992);

		return response.map(res => channel.send(`\`\`\`\n${res}\n\`\`\``));
	}
};
