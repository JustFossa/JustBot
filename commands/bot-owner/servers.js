/* eslint-disable */
const Discord = require('discord.js');

function wrap(msg, charLimit = 2000, wrapChar = '\n') {
	const messages = [];
	while (msg.length > charLimit) {
		const firstPart = msg.slice(0, charLimit);
		const lastNewline = firstPart.lastIndexOf('\n');
		messages.push(firstPart.slice(0, lastNewline));
		msg = msg.slice(lastNewline + 1);
	}
	if (msg) messages.push(msg);
	return messages;
}

function pad(str, amount) {
	return str + ' '.repeat(amount - str.length);
}

module.exports = {
	name: 'list-servers',
	description: 'Provides a list of the top servers Aeo is in',
	usage: '',
	example: '',
	aliases: ['servers', 'top-servers'],
	category: 'Owner Only',
	async execute({
		config: {
			owners,
		},
		message,
		args,
		color,
		client,
	}) {
		const { author } = message;
		if (!Object.values(owners).some(id => id == author.id)) return;

		const { channel } = message;

		const servers = message.client.guilds.cache.sort((guildA, guildB) => guildB.memberCount - guildA.memberCount).first(50);

		await Promise.allSettled(servers.map(guild => {
			return guild.members.fetch(guild.ownerID);
		}));

		const longest = servers.reduce((longest, server) => {
			if (server.name.length > longest.server) longest.server = server.name.length;
			if (server.owner.user.tag.length > longest.owner) longest.owner = server.owner.user.tag.length;
			if (server.id.length > longest.id) longest.id = server.id.length;
			if (server.memberCount.toString().length > longest.members) longest.members = server.memberCount.toString().length;
			return longest;
		}, {
			server: 'Server'.length,
			owner: 'Owner'.length,
			id: 'ID'.length,
			members: 'Total Members'.length,
		});

		const response = `${pad('Server', longest.server)} ${pad('Owner', longest.owner)} ${pad('ID', longest.id)} Total Members\n` + servers.map(guild => {
			return `${pad(guild.name, longest.server)} ${pad(guild.owner.user.tag, longest.owner)} ${pad(guild.id, longest.id)} ${guild.memberCount.toString()}`;
		}).join('\n');

		const messages = wrap(response, 1990);

		for (let i = 0; i < messages.length; i++) {
			await channel.send('```\n' + messages[i] + '\n```');
		}
	},
};
