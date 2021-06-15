const moment = require('moment');
const Discord = require('discord.js');
const { Permissions } = require('discord.js');

module.exports = {
	name: 'close-ticket',
	description: 'Closes a ticket for the ticketing system',
	usage: '',
	example: '',
	category: 'Utility',
	async execute({ client, message }) {
		if (message.channel.name.match(/-\d{17,19}$/)) {
			const text = message.channel.messages.cache.map(m => `[${moment(m.createdAt).utc().format('YYYY-M-D H:m:s')}] ${m.author.tag}: ${m.content}`).join('\n');
			const logChannel = message.guild.channels.cache.get(await client.utils.logger.getChannel(message.guild.id));
			if (logChannel) {
				logChannel.send(new Discord.MessageAttachment(Buffer.from(text), `${message.channel.name}.txt`));
			}
			return message.channel.delete('Ticket closed');
		}
	}
};
