const { MessageEmbed } = require('discord.js');
const Thread = require('../../models/thread');
const moment = require('moment');

async function run(client) {
	const threads = await Thread.find(
		{ notified: false, closed: false, last_updated: { $lte: new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)) } }
	);

	for (const thread of threads) {
		const embed = new MessageEmbed()
			.setColor(client.config.color)
			.setAuthor('## Inactivity Alert - Automated Message ##')
			.setDescription([
				'There have been no replies in this thread for 3 days, please close this thread or continue to contact the user.',
				'',
				'If there are still no replies for another 2 days then this thread will automatically be deleted!',
				'',
				'Thanks for using me lol**!'
			]);

		const channel = client.channels.cache.get(thread.channel);
		if (channel) {
			await Thread.updateOne(
				{ recipient: thread.recipient, id: thread.id },
				{ $set: { notified: true } }
			);
			await channel.send({ embed });
		} else {
			await Thread.updateOne(
				{ recipient: thread.recipient, id: thread.id },
				{ $set: { closed: true } }
			);
		}
	}

	for (const thread of await Thread.find({
		closed: false, or: [
			{
				last_updated: { $lte: new Date(Date.now() - (5 * 24 * 60 * 60 * 1000)) },
				notified: true
			},
			{
				expires_at: { $lte: new Date() }
			}
		]
	})) {
		await Thread.updateOne(
			{ recipient: thread.recipient, id: thread.id },
			{ $set: { closed: true } }
		);

		const channel = client.channels.cache.get(thread.channel);
		if (channel) {
			const messages = await channel.messages.fetch();

			const text = messages.sort((a, b) => a.createdAt - b.createdAt)
				.map(m => `[${moment(m.createdAt).utc().format('YYYY-M-D H:m:s')}] ${m.author.tag}: ${m.content || m.embeds?.[0]?.description}`)
				.join('\n');

			const user = client.users.cache.get(thread.recipient);
			const embed = new MessageEmbed()
				.setColor(client.config.color)
				.setAuthor('ModMail channel closed')
				.setDescription([
					'**Actioned by:**',
					`\`${client.user.tag}\``,
					'',
					'**User\'s thread:**',
					`\`${user.tag ?? thread.recipient}\``
				]);

			await channel.guild.log({
				embeds: [embed],
				files: [{
					attachment: Buffer.from(text), name: `${channel.name}-modmail.txt`
				}]
			});

			if (user) {
				await user.send({
					embed: {
						description: `This thread has now been closed, responding will create a new thread!`,
						color: client.config.color
					}
				}).catch(() => null);
			}

			await channel.delete().catch(() => null);
		}
	}
}

async function init(client) {
	await run(client);
	setInterval(() => run(client), 5 * 60 * 1000);
}

module.exports = async client => {
	await init(client);
	return Promise.resolve();
};

