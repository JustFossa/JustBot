const moment = require('moment');
const Discord = require('discord.js');

module.exports = async (client, reaction, user) => {
	if (reaction.message.deleted) return;
	if (reaction.message.partial) await reaction.message.fetch().catch(() => null);
	if (reaction.partial) await reaction.fetch().catch(() => null);

	if (user.bot) return;
	const message = reaction.message;
	if (reaction.emoji.name === '🎟️') {
		if (reaction.message.channel.permissionsFor(client.user).has('MANAGE_MESSAGES')) await reaction.users.remove(user.id);

		const settings = await client.utils.settings.fetch(message.guild.id);
		if (!settings.ticketSystem.enabled) return;
		if (reaction.message.id !== settings.ticketSystem.messageID) return;
		const category = message.guild.channels.cache.get(settings.ticketSystem.categoryID);
		const channelName = `${user.username}-${user.discriminator}`;
		if (category?.children.some(ch => ch.topic?.includes(user.id))) return;

		const ticketChannel = await message.guild.channels.create(channelName, {
			parent: category,
			permissionOverwrites: [
				...category.permissionOverwrites.values(),
				{
					id: user,
					allow: [
						'VIEW_CHANNEL',
						'SEND_MESSAGES'
					]
				}
			],
			reason: 'Ticket opened',
			topic: `${user.tag} (${user.id})`
		});
		const welcomeMessage = await ticketChannel.send(user, new Discord.MessageEmbed({
			title: 'Ticketing System',
			description: `${settings.ticketSystem.channelMessage}\n\n ✋ - Close the ticket`,
			color: client.config.color
		}));
		await welcomeMessage.react('✋');
	}

	if (reaction.emoji.name === '✋' && message.embeds.some(e => e.title === 'Ticketing System')) {
		const text = message.channel.messages.cache.map(m => `[${moment(m.createdAt).utc().format('YYYY-M-D H:m:s')}] ${m.author.tag}: ${m.content}`).join('\n');
		const logChannel = message.guild.channels.cache.get(await client.utils.logger.getChannel(message.guild.id));
		if (logChannel) {
			logChannel.send(new Discord.MessageAttachment(Buffer.from(text), `${message.channel.name}-TicketSystem.txt`));
		}
		return message.channel.delete('Ticket closed');
	}
};
