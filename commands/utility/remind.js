const Reminder = require('../../models/ReminderSchema');
const REMINDER_LIMIT = 10;
const ms_ = require('ms');
const emojis = require('../emojis/emojis');

const duration = msg => {
	const dur = ms_(msg);
	if (dur && dur >= 60000 && typeof dur === 'number') return dur;
};

module.exports = {
	name: 'remind',
	description: 'Adds a reminder',
	aliases: ['remind-me', 'remember'],
	category: 'Utility',
	async execute({ message, args, client }) {
		client.config.hold.add(`${message.guild.id}:message_deleted`);
		await message.delete().catch(() => client.config.hold.delete(`${message.guild.id}:message_deleted`));

		const msg = await message.channel.send(client.embed('When would you like to be reminded about this?'));
		const awaited = await message.channel.awaitMessages(
			msg => msg.author.id === message.author.id,
			{ max: 1, time: 30000, errors: ['time'] }
		).catch(() => null);

		if (!awaited) {
			return msg.edit(`${emojis.cross} The command timed-out, please type the command to try again!`);
		}

		const m = awaited?.first();
		await m.delete();
		if (m?.content?.toLowerCase() === 'stop') {
			return msg.edit(`${emojis.tick} Command successfully terminated!`);
		}

		const ms = duration(m?.content);
		if (!ms) return msg.edit(`${emojis.cross} Please use a proper time format (e.g. 30m, 1h, 1d)`);
		const reminderCount = await Reminder.countDocuments({ user: message.author.id });
		if (reminderCount > REMINDER_LIMIT) {
			return msg.edit(`${emojis.cross} you already have ${REMINDER_LIMIT} ongoing reminders...`);
		}

		await msg.edit(client.embed('What would you like to be reminded about?'));
		const res = await message.channel.awaitMessages(
			msg => msg.author.id === message.author.id,
			{ max: 1, time: 30000, errors: ['time'] }
		).catch(() => null);

		const reason = res?.first();
		await reason.delete();
		if (reason?.content?.toLowerCase() === 'stop') {
			return msg.edit(`${emojis.tick} Command successfully terminated!`);
		}

		await client.utils.remindScheduler.addReminder({
			user: message.author.id,
			reason: reason?.content?.substring(0, 1024),
			message: message.url,
			createdAt: new Date(Date.now() + ms)
		});

		return msg.edit(`${emojis.tick} I'll remind you in ${ms_(ms, { long: true })} **${message.author.tag}**`);
	}
};
