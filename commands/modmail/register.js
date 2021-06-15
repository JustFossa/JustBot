/*const moment = require('moment');
const { Permissions } = require('discord.js');
const Thread = require('../../models/thread');

module.exports = {
	name: 'register',
	description: 'Opens a ModMail thread',
	usage: '<userID>',
	example: '434693228189712385',
	category: 'ModMail',
	clientPermissions: [Permissions.FLAGS.MANAGE_CHANNELS, Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.USE_EXTERNAL_EMOJIS],

	async execute({ client, message }) {
		const user = message.author;
		message.delete();
		const active = await Thread.countDocuments({ recipient: user.id, closed: false });
		if (active) return message.channel.send('⚠️ You can\'t create another thread.');

		const guild = client.guilds.cache.get('827257197565837312');
		const settings = await client.utils.settings.fetch(guild.id);
		const category = guild.channels.cache.get(settings?.modMailSystem?.categoryID);
		if (!category) return message.channel.send('⚠️ The ModMail system is not enabled!');
		const channelName = `${user.username}-${user.discriminator}`;

		const channel = await guild.channels.create(channelName, {
			parent: category,
			reason: `New Thread: **${user.tag} (${user.id})**`,
			topic: `${user.tag} (${user.id})`
		});

		let threadID = await Thread.countDocuments();
		threadID += 1;

		try {
			await user.send({
				embed: {
					description: '**Registration**\nPlease enter your registration like the **[Example](https://discord.com/channels/827257197565837312/836901648554000404/836901681995317278)**',
					color: 0x5DE67B
				}
			});
		} catch {
			return message.channel.send('⚠️ Your DMs are disabled, please enable it then run this comand again!');
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
					` \`${guild.member(user).joinedAt.toDateString()}\``,
					'',
					'**Thread Count:**',
					` \`${await Thread.countDocuments({ recipient: user.id })}\``,
					'',
					'**Roles in server:**',
					guild.member(user)
						.roles.cache
						.filter(role => role.id !== guild.id)
						.map(role => role).join('\n')
				].join('\n'),
				color: client.config.color
			}
		});

		return message.channel.send(`${message.author}✅ Successfully created your registration`);
		
	}
	
};*/
