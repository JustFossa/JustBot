module.exports = {
	name: 'leave-guild',
	aliases: ['guild-leave', 'leave-server'],
	description: 'Forces the bot to leave a guild',
	usage: '<guildID>',
	example: '681174156905283807',
	category: 'Owner Only',
	async execute({ config: { owners: owner }, message, args }) {
		const owners = Object.values(owner);
		if (!owners.includes(message.author.id)) {
			return;
		}

		const guild = message.client.guilds.cache.get(args[0]);
		await guild.leave();
		await message.delete();
		return message.channel.temp('I have left the guild.');
	}
};
