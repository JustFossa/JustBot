const moment = require('moment');
const Discord = require('discord.js');
const Thread = require('../../models/thread');
const { Permissions } = require('discord.js');

const ms = require('ms');
const emojis = require('../emojis/emojis');
const duration = msg => {
	if (!msg) return null;
	const dur = ms(msg);
	if (dur && dur >= 60000 && typeof dur === 'number') return new Date(Date.now() + dur);
	return null;
};

module.exports = {
	name: 'close',
	description: 'Closes a ModMail thread, please note this command can only be used in a Modmail channel.',
	usage: '',
	example: '',
	category: 'ModMail',
	aliases: ['close-modmail'],
	async execute({ client, message, args }) {
		const exp = duration(args[0]);
		if (args[0] && !exp) {
			return message.channel.send(`${emojis.cross} Please enter a valid time format, 30m, 6h or 2d!`);
		}

		const thread = await Thread.findOneAndUpdate(
			{ channel: message.channel.id, closed: false },
			{ $set: { closed: true, expires_at: exp } }
		);
		if (!thread) return;

		const channel = message.guild.channels.cache.get(thread.channel);
		if (!channel) return;
		const messages = await channel.messages.fetch();

		const text = messages.sort((a, b) => a.createdAt - b.createdAt)
			.map(m => `[${moment(m.createdAt).utc().format('YYYY-M-D H:m:s')}] ${m.author.tag}: ${m.content || m.embeds?.[0]?.description}`)
			.join('\n');

		const user = client.users.cache.get(thread.recipient);
		const embed = new Discord.MessageEmbed()
			.setColor(client.config.color)
			.setAuthor('ModMail channel closed')
			.setDescription([
				'**Actioned by:**',
				`\`${message.author.tag}\``,
				'',
				'**User\'s thread:**',
				`\`${user?.tag ?? thread.recipient}\``
			]);

		await message.guild.log({
			embeds: [embed],
			files: [{
				attachment: Buffer.from(text), name: `${message.channel.name}-modmail.txt`
			}]
		});

		if (user) {
			await user.send({
				embed: {
					description: ' **[TH2 ModMail](https://discord.gg/dGAfkq2VzP)**\n This thread has now been closed, responding will create a new thread!',
					color: client.config.color
				}
			}).catch(() => null);
		}

		return message.channel.delete().catch(() => null);
	}
};
