const Discord = require('discord.js');
const { Permissions } = require('discord.js');
const emojis = require('../emojis/emojis');

module.exports = {
	name: 'send-message',
	description: 'Send a message through the bot',
	usage: '<mentionChannel> <message>',
	example: '#general hello there',
	category: 'Utility',
	aliases: ['send', 'announce', 'announcement'],
	clientPermissions: [Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [Permissions.FLAGS.MANAGE_MESSAGES],

	async execute({ message, client }) {
		await message.delete().catch(() => null);
		const embed = new Discord.MessageEmbed()
			.setColor(global.config.color);

		const msg = await message.channel.send(client.embed('Which channel would you like the message to be sent in?'));
		const awaited = await message.channel.awaitMessages(
			msg => msg.author.id === message.author.id,
			{ max: 1, time: 60000, errors: ['time'] }
		).catch(() => null);

		if (!awaited) {
			return msg.edit(`${emojis.cross} The command timed-out, please type the command to try again!`, { embed: null });
		}

		const m = awaited?.first();
		if (m?.content?.toLowerCase() === 'stop') {
			return msg.edit(`${emojis.tick} Command successfully terminated!`, { embed: null });
		}

		await m.delete().catch(() => null);
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

		mText.delete().catch(() => null);

		const channel = message.guild.channels.cache.get(m.content?.match(/\d+/)?.[0]);
		if (!channel) return msg.edit('Please mention a valid channel.', { embed: null });

		embed.setDescription(mText.content.substring(0, 2048));

		const missingPerm = !channel.permissionsFor(client.user).has(
			[Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.ATTACH_FILES]
		);
		if (missingPerm) return;

		await channel.send(embed);
		return msg.edit('Message sent successfully', { embed: null }).then(msg => msg.delete({ timeout: 3000 }));
	}
};
