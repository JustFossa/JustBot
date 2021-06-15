const { Permissions } = require('discord.js');

const MAX_AGE = 7 * 24 * 60 * 60 * 1000;

module.exports = {
	name: 'clear-messages',
	description: 'Clears messages in the current channel',
	usage: '<amount> [user]',
	example: '10',
	category: 'Moderation',
	aliases: ['clean', 'purge', 'clear'],
	args: true,
	logs: true,
	clientPermissions: [Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [Permissions.FLAGS.MANAGE_MESSAGES],

	async execute({ client, message, args, utils: { logger: logUtil }, color }) {
		client.config.hold.add(`${message.guild.id}:message_deleted`);
		await message.delete().catch(() => client.config.hold.delete(`${message.guild.id}:message_deleted`));

		const { member, channel, guild, author } = message;

		const amount = Number(args[0]);
		if (isNaN(amount)) return channel.temp('You must specify an amount!');
		if (amount > 100 || amount < 1) {
			return channel.temp('The minimum amout is 1 and the maximum is 100!');
		}

		const user = client.users.cache.get(args[1]?.match(/\d+/)?.[0]);
		try {
			await logUtil.ensureEmbed(channel);
		} catch (err) {
			return;
		}

		const fetched = await message.channel.messages.fetch({ limit: 100 }, false).catch(() => null);
		if (!fetched) return;
		let messages = [];
		if (user) {
			messages = fetched
				.filter(msg => msg.author.id === user.id && (new Date() - new Date(msg.createdAt) <= MAX_AGE))
				.array()
				.slice(0, amount);
		} else {
			messages = fetched
				.filter(msg => new Date() - new Date(msg.createdAt) <= MAX_AGE)
				.array()
				.slice(0, amount);
		}

		try {
			await channel.bulkDelete(messages);
		} catch (err) {
			return channel.temp('Failed to delete the messages!');
		}

		await channel.temp(`Successfully deleted **${messages.length}** messages!`);
		return guild.log({
			embeds: [{
				title: '**Messages Cleared**',
				description: `**Actioned by:**\n\`${author.tag}\`\n\n**Channel:**\n${channel}\n\n**Count:**\n\`${messages.length}\``,
				color
			}]
		});
	}
};
