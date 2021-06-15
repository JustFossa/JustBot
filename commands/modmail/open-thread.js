const moment = require('moment');
const Discord = require('discord.js');
const { Permissions } = require('discord.js');
const Thread = require('../../models/thread');

module.exports = {
	name: 'open-thread',
	description: 'Opens a ModMail thread with the specified user',
	usage: '<userID>',
	example: '434693228189712385',
	aliases: ['ot', 'thread-open'],
	category: 'ModMail',
	clientPermissions: [Permissions.FLAGS.MANAGE_CHANNELS, Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [Permissions.FLAGS.MANAGE_GUILD, Permissions.FLAGS.MANAGE_CHANNELS],

	async execute({ client, message, args, settings }) {
		const user = await client.users.fetch(args[0]?.match(/\d+/)).catch(() => null);
		const member = await message.guild.members.fetch(user?.id).catch(() => null);
		if (!user || (!client.isOwner(message.author.id) && !member)) {
			return message.channel.send('⚠️ This user does not have mutual servers with the bot!');
		}

		if (user.bot) {
			return message.channel.send('⚠️ You can\'t create a thread with a bot!');
		}

		const active = await Thread.countDocuments({ recipient: user.id, closed: false });
		if (active) return message.channel.send('⚠️ You can\'t create another thread with this user.');

		const category = message.guild.channels.cache.get(settings?.modMailSystem?.categoryID);
		if (!category) return message.channel.send('⚠️ The ModMail system is not enabled!');
		const channelName = `${user.username}-${user.discriminator}`;

		const channel = await message.guild.channels.create(channelName, {
			parent: category,
			reason: `New Thread: **${user.tag} (${user.id})**`,
			topic: `${user.tag} (${user.id})`
		});

		let threadID = await Thread.countDocuments();
		threadID += 1;

		try {
			await user.send({
				embed: {
					description: `⚠️ A ModMail thread has been opened with you in ${message.guild.name}`,
					color: 0x5DE67B
				}
			});
		} catch {
			return message.channel.send('⚠️ This user has DMs disabled!');
		}

		await new Thread({
			id: threadID,
			closed: false,
			channel: channel.id,
			timestamp: new Date(),
			guild: channel.guild.id,
			recipient: user.id
		}).save();

		await channel.send({
			embed: {
				description: [
					`**${user.tag} created a new thread!**`,
					'',
					'**Account Creation Date:**',
					` \`${user.createdAt.toDateString()}\``,
					'',
					'**Server Join Date:**',
					`\`${message.guild.member(user).joinedAt.toDateString()}\``,
					'',
					'**Thread Count:**',
					` \`${await Thread.countDocuments({ recipient: user.id })}\``,
					'',
					'**Roles in server:**',
					message.guild.member(user)
						.roles.cache
						.filter(role => role.id !== message.guild.id)
						.map(role => role).join('\n')
				].join('\n'),
				color: client.config.color
			}
		});

		return message.channel.send(`Thread successfully created for ${channel}`);
	}
};
