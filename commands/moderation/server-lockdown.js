const Lock = require('../../models/lock');
const ms = require('ms');
const { Permissions } = require('discord.js');
const cooldowns = new Map();

module.exports = {
	name: 'server-lockdown',
	description: 'Locks the server, stops everyone from sending messages in the server',
	usage: '',
	example: '',
	category: 'Moderation',
	clientPermissions: [Permissions.FLAGS.MANAGE_CHANNELS, Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [Permissions.FLAGS.MANAGE_CHANNELS, Permissions.FLAGS.MANAGE_GUILD],
	logs: true,
	async execute({ client, message, color, utils, args }) {
		client.config.hold.add(`${message.guild.id}:message_deleted`);
		await message.delete().catch(() => client.config.hold.delete(`${message.guild.id}:message_deleted`));

		const { member, channel, guild, author } = message;

		const time1 = cooldowns.get(message.author.id, new Date().getTime());
		const secBetween = (new Date().getTime() - time1) / 1000;
		const duration = 60 * 60 * 24;

		function secondsToDhms(d) {
			d = Number(d);
			const days = Math.floor(d / (3600 * 24));
			const h = Math.floor(d / 3600 % 24);
			const m = Math.floor(d % 3600 / 60);
			// const s = Math.floor(d % 3600 % 60);

			const dDisplay = days > 0 ? days + (days === 1 ? ' day, ' : ' days, ') : '';
			const hDisplay = h > 0 ? h + (h === 1 ? ' hour, ' : ' hours, ') : '';
			const mDisplay = m > 0 ? m + (m === 1 ? ' minute ' : ' minutes ') : '';
			return dDisplay + hDisplay + mDisplay;
		}

		if (cooldowns.has(message.author.id)) return message.channel.send(`You must wait **${secondsToDhms(duration - secBetween)}**`);

		cooldowns.set(message.author.id, new Date().getTime());
		setTimeout(() => {
			cooldowns.delete(message.author.id);
		}, 1000 * 60 * 60 * 24);

		let time;
		if (args.length > 0) {
			try {
				time = ms(args.join(' '));
			} catch (err) {
				return message.channel.send('Failed parsing time');
			}
			if (!time) return message.channel.send('Invalid time provided!');
		}

		message.guild.channels.cache.forEach(async channel => {
			utils.locks.lock(channel);

			if (time) {
				utils.locks.addTimer(channel, time);
				await Lock.findOneAndUpdate({ channelID: channel.id }, { time: new Date(Date.now() + time) }, { upsert: true, new: true });
			}
		});

		guild.log({
			embeds: [{
				title: '**Server Locked**',
				description: `**Actioned by:**\n\`\`\`${author.tag}\`\`\``,
				color
			}]
		});

		message.channel.send('Server successfully locked!');
	}
};
