const moment = require('moment');
const Discord = require('discord.js');
const Thread = require('../../models/thread');
const { Permissions } = require('discord.js');

module.exports = {
	name: 'alert',
	description: 'Alerts you when the user replies on a ModMail thread. Please note this command can only be used in a Modmail channel',
	usage: '',
	example: '',
	category: 'ModMail',
	aliases: ['alert-me'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [],
	async execute({ client, message }) {
		const thread = await Thread.findOneAndUpdate(
			{ channel: message.channel.id, closed: false },
			{ $addToSet: { subscribers: message.author.id } }
		);

		if (!thread) return;
		return message.channel.send('I will alert you when this user replies!');
	}
};
