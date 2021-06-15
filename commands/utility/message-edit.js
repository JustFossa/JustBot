const { Permissions } = require('discord.js');
const emojis = require('../emojis/emojis');

module.exports = {
	name: 'embed-edit',
	description: 'Edits the message sent by the bot',
	usage: '<messageID> <newMessage>',
	example: '812213727859703808 hey',
	category: 'Utility',
	aliases: ['edit', 'edit-embed', 'edit-message', 'message-edit', 'edit-announcement'],
	clientPermissions: [
		Permissions.FLAGS.MANAGE_MESSAGES,
		Permissions.FLAGS.USE_EXTERNAL_EMOJIS
	],
	userPermissions: [Permissions.FLAGS.MANAGE_MESSAGES],

	async execute({ message, client }) {
		await message.delete();
		const msg = await message.channel.send(client.embed('Please provide the link of the embed you would like to edit.'));
		const awaited = await message.channel.awaitMessages(
			msg => msg.author.id === message.author.id,
			{ max: 1, time: 60000, errors: ['time'] }
		).catch(() => null);

		if (!awaited) {
			return msg.edit(`${emojis.cross} The command timed-out, please type the command to try again!`, { embed: null });
		}

		const m = awaited?.first();
		await m.delete();
		if (m?.content?.toLowerCase() === 'stop') {
			return msg.edit(`${emojis.tick} Command successfully terminated!`, { embed: null });
		}

		await msg.edit(client.embed('What message would you like to send?'));
		const res = await message.channel.awaitMessages(
			msg => msg.author.id === message.author.id,
			{ max: 1, time: 30000, errors: ['time'] }
		).catch(() => null);

		if (!res) {
			return msg.edit(`${emojis.cross} The command timed-out, please type the command to try again!`, { embed: null });
		}

		const mText = res.first();
		if (mText?.content?.toLowerCase() === 'stop') {
			return msg.edit(`${emojis.tick} Command successfully terminated!`, { embed: null });
		}

		const messageID = m.content.split('/').filter(d => d.length).reverse()[0];
		const channelID = m.content.split('/').filter(d => d.length).reverse()[1];
		const channel = message.guild.channels.cache.get(channelID);
		const foundMsg = await channel?.messages.fetch(messageID).catch(() => null);
		if (!foundMsg) {
			return msg.edit(
				'I could not find that message.',
				{ embed: null }
			);
		}

		await foundMsg.edit({
			embed: {
				color: global.config.color,
				description: mText.content
			}
		});

		return msg.edit(
			'Successfully edited the message.',
			{ embed: null }
		);
	}
};
