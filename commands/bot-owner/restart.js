module.exports = {
	name: 'restart',
	description: 'Restarts the bot',
	usage: '',
	example: '',
	category: 'Owner Only',
	async execute({ config: { owners: owner }, message, client }) {
		const owners = Object.values(owner);
		if (!owners.includes(message.author.id)) {
			return;
		}
		await message.channel.send(` **Bot restarted...**\n• Loaded \`${client.commands.size}\` commands`);

		const masterLogger = client.channels.cache.get('830590930004213760');
		if (masterLogger) {
			await masterLogger.send({
				embed: {
					title: 'Client Restarted',
					description: [
						'**Actioned by:**',
						`\`${message.author.tag}\``
					].join('\n'),
					color: global.config.color
				}
			});
		}

		return process.exit();
	}
};
