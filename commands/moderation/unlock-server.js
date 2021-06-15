const { Permissions } = require('discord.js');
const cooldowns = new Map();

module.exports = {
	name: 'unlock-server',
	description: 'Unlocks the server allowing users to send messages in the server again',
	usage: '',
	example: '',
	category: 'Moderation',
	aliases: ['unlocks'],
	modBypass: true,
	clientPermissions: [Permissions.FLAGS.MANAGE_CHANNELS, Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [Permissions.FLAGS.MANAGE_CHANNELS, Permissions.FLAGS.MANAGE_GUILD],
	logs: true,
	async execute({ message, color, utils, client }) {
		client.config.hold.add(`${message.guild.id}:message_deleted`);
		await message.delete().catch(() => client.config.hold.delete(`${message.guild.id}:message_deleted`));
		const { member, channel, guild } = message;

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

		if (channel.permissionsFor(guild.id).has('SEND_MESSAGES')) return message.channel.send('Server already unlocked!');

		message.guild.channels.cache.forEach(async channel => {
			utils.locks.unlock(channel);
		});

		guild.log({
			embeds: [{
				title: '**Server Unlocked**',
				description: `**Actioned by:**\n\`\`\`${member.user.tag}\`\`\``,
				color
			}]
		});

		message.channel.send('Server successfully unlocked!');
	}
};
