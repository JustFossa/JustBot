const Reminder = require('../models/ReminderSchema');
const { MessageEmbed } = require('discord.js');

class RemindScheduler {
	constructor(client, { checkRate = 5 * 60 * 1000 } = {}) {
		this.client = client;
		this.checkRate = checkRate;
		this.queuedSchedules = new Map();
	}

	async addReminder(reminder) {
		const dbReminder = await Reminder.create({
			user: reminder.user,
			reason: reminder.reason,
			message: reminder.message,
			createdAt: reminder.createdAt
		});
		if (dbReminder.createdAt < (Date.now() + this.checkRate)) {
			this.queueReminder(dbReminder);
		}
	}

	cancelReminder(id) {
		const schedule = this.queuedSchedules.get(id);
		if (schedule) this.client.clearTimeout(schedule);
		return this.queuedSchedules.delete(id);
	}

	async deleteReminder(reminder) {
		const schedule = this.queuedSchedules.get(reminder._id);
		if (schedule) clearTimeout(schedule);
		this.queuedSchedules.delete(reminder._id);
		const deleted = await Reminder.deleteOne({ _id: reminder._id });
		return deleted;
	}

	queueReminder(reminder) {
		this.queuedSchedules.set(reminder._id, setTimeout(() => {
			this.runReminder(reminder);
		}, reminder.createdAt - Date.now()));
	}

	async runReminder(reminder) {
		try {
			const embed = new MessageEmbed()
				.setDescription([
					`**Reminder:** ${reminder.reason || 'You wanted me to remind you around this time?'}`
				]);

			const user = await this.client.users.fetch(reminder.user);
			if (user) await user.send({ embed }).catch(() => null);
		} catch (error) {
			console.error(`REMINDER ERROR: ${error.message}`);
		}

		try {
			await this.deleteReminder(reminder);
		} catch (error) {
			console.error(`REMINDER ERROR: ${error.message}`);
		}
	}

	async init() {
		await this._check();
		setInterval(this._check.bind(this), this.checkRate);
	}

	async _check() {
		const reminders = await Reminder.find({
			createdAt: { $lt: new Date(Date.now() + this.checkRate) }
		});
		const now = new Date();

		for (const reminder of reminders) {
			if (this.queuedSchedules.has(reminder.id)) continue;

			if (reminder.createdAt < now) {
				this.runReminder(reminder);
			} else {
				this.queueReminder(reminder);
			}
		}
	}
}

module.exports = {
	name: 'remindScheduler',
	construct(client) {
		return new RemindScheduler(client);
	}
};
