const Lock = require('../../models/lock');
const ms = require('ms');
const { Permissions } = require('discord.js');
module.exports = {
	name: 'lock-channel',
	description: 'Locks the channel, stops everyone from sending messages in the current channel',
	usage: '',
	example: '',
	category: 'Moderation',
	aliases: ['lock'],
	modBypass: true,
	clientPermissions: [Permissions.FLAGS.MANAGE_CHANNELS, Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [Permissions.FLAGS.MANAGE_CHANNELS],
	logs: true,
	async execute({ client, message, color, utils, args }) {
		client.config.hold.add(`${message.guild.id}:message_deleted`);
		await message.delete().catch(() => client.config.hold.delete(`${message.guild.id}:message_deleted`));

		const { member, channel, guild, author } = message;

		let time;
		if (args.length > 0) {
			try {
				time = ms(args.join(' '));
			} catch (err) {
				return message.channel.send('Failed parsing time');
			}
			if (!time) return message.channel.send('Invalid time provided!');
		}

		utils.locks.lock(channel);

		if (time) {
			utils.locks.addTimer(channel, time);
			await Lock.findOneAndUpdate({ channelID: channel.id }, { time: new Date(Date.now() + time) }, { upsert: true, new: true });
		}

		guild.log({
			embeds: [{
				title: '**Channel Locked**',
				description: `**Actioned by:**\n\`\`\`${author.tag}\`\`\`\n\n**Channel:**\n${channel}`,
				color
			}]
		});

		channel.temp('Channel successfully locked!');
	}
};
