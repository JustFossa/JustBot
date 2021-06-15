const Discord = require('discord.js');
const { Permissions } = require('discord.js');
const emojis = require('../emojis/emojis');
async function deleteID(client, channelID, messageID) {
	const message = await client.channels.cache.get(channelID)?.messages.fetch(messageID).catch(() => null);
	return message?.delete().catch(() => null);
}

module.exports = {
	name: 'ticket-system',
	description: 'Sets up the ticketing system in your server',
	usage: '',
	example: '',
	logs: true,
	category: 'Utility',
	aliases: ['ticketsystem', 'ticketing', 'ticket', 'tickets'],
	clientPermissions: [Permissions.FLAGS.ADMINISTRATOR],
	userPermissions: [Permissions.FLAGS.MANAGE_GUILD],

	async execute({ client, message, settings, utils: { settings: settingsManager } }) {
		message.delete().catch(() => null);
		const { guild } = message;

		const msg = await message.channel.send(client.embed('What message would you like the ticket system embed to show?'));
		const awaited = await message.channel.awaitMessages(
			msg => msg.author.id === message.author.id,
			{ max: 1, time: 30000, errors: ['time'] }
		).catch(() => null);

		if (!awaited) {
			return msg.edit(`${emojis.cross} The command timed-out, please type the command to try again!`, { embed: null });
		}

		const m = awaited?.first();
		await m?.delete().catch(() => null);
		if (m?.content?.toLowerCase() === 'stop') {
			return msg.edit(`${emojis.tick} Command successfully terminated!`, { embed: null });
		}

		await msg.edit(client.embed('What would you like the ticket channel message to show?'));
		const res = await message.channel.awaitMessages(
			msg => msg.author.id === message.author.id,
			{ max: 1, time: 30000, errors: ['time'] }
		).catch(() => null);

		if (!res) {
			return msg.edit(`${emojis.cross} The command timed-out, please type the command to try again!`, { embed: null });
		}

		const mText = res.first();
		await mText.delete();
		if (mText?.content?.toLowerCase() === 'stop') {
			return msg.edit(`${emojis.tick} Command successfully terminated!`, { embed: null });
		}

		await msg.edit(client.embed('Which roles would you like to have view the ticket system category?'));
		const roleM = await message.channel.awaitMessages(
			msg => msg.author.id === message.author.id,
			{ max: 1, time: 80000, errors: ['time'] }
		).catch(() => null);

		if (!roleM) {
			return msg.edit(`${emojis.cross} The command timed-out, please type the command to try again!`, { embed: null });
		}

		const roleT = roleM.first();
		await roleT.delete();
		const role = guild.roles.cache.find(r => r.name.toLowerCase() === roleT.content) || guild.roles.cache.get(roleT.content.match(/\d+/)?.[0]);
		if (!role) {
			return msg.edit(`${emojis.cross} Role not found!`, { embed: null });
		}

		if (mText?.content?.toLowerCase() === 'stop') {
			return msg.edit(`${emojis.tick} Command successfully terminated!`, { embed: null });
		}

		await deleteID(client, settings?.ticketSystem?.channelID, settings?.ticketSystem?.messageID);
		let categoryChannelID = settings?.ticketSystem?.categoryID;
		if (!client.channels.cache.has(categoryChannelID)) {
			categoryChannelID = (await guild.channels.create('tickets', {
				type: 'category',
				permissionOverwrites: [
					{
						id: guild.id,
						deny: 'VIEW_CHANNEL'
					},
					{
						id: message.author,
						allow: 'VIEW_CHANNEL'
					},
					{
						id: client.user,
						allow: 'VIEW_CHANNEL'
					},
					{
						id: role,
						allow: 'VIEW_CHANNEL'
					}
				]
			})).id;
		}

		const ticketSystemEmbed = new Discord.MessageEmbed({
			author: {
				iconURL: message.guild.iconURL(),
				name: client.user.username
			},
			title: 'Ticket system',
			description: [
				m.content
			].join('\n'),
			color: client.config.color
		});

		const ticketMessage = await message.channel.send(ticketSystemEmbed);
		await ticketMessage.react('🎟️');

		settings.ticketSystem = {
			enabled: true,
			categoryID: categoryChannelID,
			messageID: ticketMessage.id,
			channelID: message.channel.id,
			channelMessage: mText.content
		};
		return settingsManager.save(settings);
	}
};
