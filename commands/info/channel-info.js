const { MessageEmbed } = require('discord.js');
const moment = require('moment');
const { Permissions } = require('discord.js');
const emojis = require('../emojis/emojis');

module.exports = {
	name: 'channel-info',
	description: 'Displays information about the channel',
	usage: '<mentionChannel>',
	example: '#general',
	category: 'Utility',
	aliases: ['cinfo'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [],
	async execute({ message, client }) {
		const msg = await message.channel.send(client.embed('Which channel would you like info on?'));
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

		const channel = m.mentions.channels.first();

		if (!channel) {
			return msg.edit('You must mention a channel!', { embed: null });
		}

		const embed = new MessageEmbed()
			.setColor(global.config.color)
			.setThumbnail(message.guild.iconURL({ format: 'png' }))
			.setAuthor(`Channel: #${channel.name}`)
			.setDescription(
				`**[TH2 Server](https://discord.gg/dusNMvr7ur)**
				
**Channel ID** 
\`${channel.id}\`

**Creation Date**
\`${moment(channel.createdAt).format('MMMM D, YYYY')}\`

**Topic**
\`${channel.topic ? channel.topic : 'None'}\`

**Type**
\`${channel.topic ? channel.topic : 'None'}\`

**NSFW**
\`${channel.nsfw ? 'Yes' : 'No'}\``
			);

		msg.edit(embed);
	}
};
