const Discord = require('discord.js');
const { Permissions } = require('discord.js');
const emojis = require('../emojis/emojis');

module.exports = {
	name: 'send-image',
	description: 'Send an image through the bot',
	usage: '<mentionChannel> <imageLink>',
	example: '#general https://cdn.discordapp.com/attachments/730156980358086707/802271085520617492/Thank_you.png',
	category: 'Utility',
	aliases: ['image-send', 'image'],
	clientPermissions: [Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [Permissions.FLAGS.MANAGE_MESSAGES],

	async execute({ message, client }) {
		await message.delete();
		const embed = new Discord.MessageEmbed()
			.setColor(global.config.color);

		const msg = await message.channel.send(client.embed('Which channel would you like the image to be sent in?'));
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

		await msg.edit(client.embed('Please provide the link to the image you would like to send.'));
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

		const channel = message.guild.channels.cache.get(m.content?.match(/\d+/)?.[0]);
		if (!channel) return msg.edit('Please mention a valid channel.', { embed: null });

		if (!mText.content.startsWith('http')) {
			return msg.edit(`${emojis.cross} Invalid link.`);
		}

		const missingPerm = !channel.permissionsFor(client.user).has(
			[Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.ATTACH_FILES]
		);
		if (missingPerm) return;

		await channel.send({ files: [mText.content] });
		return msg.edit('Message sent successfully').then(msg => msg.delete({ timeout: 3000 }));
	}
};
