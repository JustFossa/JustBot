const { MessageEmbed, Collection } = require('discord.js');
const Thread = require('../../models/thread');
const users = new Collection();
const timeOut = 1 * 60 * 1000;

const emojis = {
	'offline': 'offline',
	'dnd': 'dnd',
	'online': 'online',
	'idle': 'idle'
};

function getDevice(user, device) {
	if (!device) return [];
	const devices = [];
	if (device.mobile) devices.push(`${'online_mobile'} \`Mobile\``);
	if (device.desktop) devices.push(`${emojis[user.presence.status]} \`Desktop\``);
	if (device.web) devices.push(`${emojis[user.presence.status]} \`Website\``);
	return devices;
}

async function open(client, message) {
	if (message.author.bot) return;
	if (message.channel.type !== 'dm') return;
	if (users.has(message.author.id)) return;

	const support = client.guilds.cache.get('827257197565837312');
	const mutualGuilds = client.guilds.cache.filter(guild => guild.members.cache.has(message.author.id));
	if (!mutualGuilds.length) return;

	const enabledGuilds = Array.from(
		client.utils.settings.collection()
			.filter(guild => guild?.modMailSystem?.categoryID)
			.values()
	);
	if (!enabledGuilds.length) return;

	const guildIds = enabledGuilds.map(d => d.guildID);
	const guilds = mutualGuilds.filter(guild => guildIds.includes(guild.id))
		.map(guild => ({ name: guild.name, id: guild.id }));
	const index = guilds.findIndex(en => en.id === support.id);
	if (index >= 0) {
		guilds.splice(index, 1);
	}
	guilds.push({ name: support.name, id: support.id });
	guilds.reverse();

	const embed = new MessageEmbed()
		.setColor(client.config.color)
		.setAuthor('Welcome to ModMail', client.user.displayAvatarURL())
		.setDescription([
			'Please respond with the number of server that you want to be in contact with.',
			'',
			guilds.map((guild, i) => `**${i + 1}.** ${guild.name}`).join('\n'),
			'',
			'This prompt will timeout in 1 minute, so if you accidentally DM\'d this bot, you can wait until then!',
			''
		]);

	users.set(
		message.author.id,
		setTimeout(() => users.delete(message.author.id), timeOut)
	);

	const msg = await message.channel.send({ embed });
	const responses = await msg.channel.awaitMessages(
		msg => msg.author.id === message.author.id,
		{
			max: 1,
			time: timeOut
		}
	);

	if (responses?.size !== 1) {
		await message.channel.send('Time ran out, if you would still like to contact ModMail then send another message!');
		return users.delete(message.author.id);
	}

	const response = responses.first()?.content;
	if (!(response >= 1 && response <= guilds.length)) {
		await message.channel.send('You entered an invalid number that is not listed, please try again!');
		return users.delete(message.author.id);
	}

	const guild = client.guilds.cache.get(guilds[response - 1]?.id);
	if (!guild) {
		await message.channel.send('You entered an invalid number that is not listed, please try again!');
		return users.delete(message.author.id);
	}

	const categoryId = enabledGuilds.find(d => d.guildID === guild.id)?.modMailSystem?.categoryID;
	const category = guild.channels.cache.get(categoryId);
	if (!category) {
		console.log('Category Channel Found (Modmail)');
		await message.channel.send(`Modmail category channel is missing for **${guild.name}**`);
		return users.delete(message.author.id);
	}

	if (!category.guild.me.hasPermission('MANAGE_CHANNELS')) return;
	const channelName = `${message.author.username}-${message.author.discriminator}`;
	const channel = await guild.channels.create(channelName, {
		parent: category,
		reason: `New Thread: **${message.author.tag} (${message.author.id})**`,
		topic: `${message.author.tag} (${message.author.id})`
	});

	let threadID = await Thread.countDocuments();
	threadID += 1;

	await new Thread({
		id: threadID,
		closed: false,
		channel: channel.id,
		timestamp: new Date(),
		guild: channel.guild.id,
		recipient: message.author.id,
		dmChannel: message.channel.id
	}).save();

	await channel.send({
		embed: {
			description: [
				`**${message.author.tag} opened a thread!**`,
				'',
				'**Account Creation Date:**',
				`\`${message.author.createdAt.toDateString()}\``,
				'',
				'**Server Join Date:**',
				`\`${guild.member(message.author)?.joinedAt.toDateString() ?? 'None'}\``,
				'',
				'**Thread Count:**',
				`\`${await Thread.countDocuments({ recipient: message.author.id })}\``,
				'',
				'**Roles in server:**',
				guild.member(message.author)?.roles.cache.filter(role => role.id !== guild.id)
					.map(role => role).join('\n') ?? 'None',

				'',
				'**Devices**',
				getDevice(message.author, message.author.presence?.clientStatus)
					.join('\n') || '<user_offline>: Offline'
			].join('\n'),
			color: client.config.color
		}
	});

	await channel.send({
		embed: {
			footer: { text: `ID: ${message.author.id}` },
			description: message.content,
			color: client.config.color,
			author: { name: message.author.tag, icon_url: message.author.displayAvatarURL({ dynamic: true }) }
		}
	});

	await message.react('📨');

	await message.channel.send({
		embed: {
			description: `Thread successfully created in **${channel.guild.name}**, please hold on and an admin will be with you shortly!`,
			color: 0x5DE67B
		}
	});

	return users.delete(message.author.id);
}

async function dm(client, message, thread) {
	const channel = client.channels.cache.get(thread.channel);
	if (!channel) {
		await Thread.updateOne({ recipient: message.author.id, closed: false }, { $set: { closed: true } });
		return open(client, message);
	}

	const embed = new MessageEmbed()
		.setColor(client.config.color)
		.setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
		.setDescription(message.content)
		.setFooter(`ID: ${message.author.id}`);

	await channel.send(`${thread.subscribers.map(id => `<@${id}>`)}`, {
		embed,
		files: [
			...message.attachments.map(m => m.url)
		]
	});

	await message.react('📨');

	await Thread.updateOne(
		{ recipient: thread.recipient, id: thread.id },
		{
			$set: {
				last_updated: new Date()
			},
			$pullAll: { subscribers: thread.subscribers }
		}
	);
}

async function channel(client, message, thread) {
	const user = client.users.cache.get(thread.recipient);
	if (!user) return message.channel.send(`Recipient for thread **#${thread.id}** can not be found.`);

	const embed = new MessageEmbed()
		.setColor(client.config.color)
		.setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true }))
		.setDescription(message.content)
		.setTimestamp();

	let msg;
	try {
		msg = await user.send({
			embed,
			files: [
				...message.attachments.map(m => m.url)
			]
		});
	} catch {
		return message.channel.send('This user has DMs disabled!');
	}

	await message.react('📨');

	await Thread.updateOne(
		{ recipient: thread.recipient, id: thread.id },
		{
			$set: {
				last_updated: new Date()
			}
		}
	);
}

module.exports = async (client, message) => {
	if (message.author.bot) return;
	// await Thread.deleteMany({ });
	if (client.config.blacklists && await client.utils.userBlacklists.active(message.author.id)) return;

	if (message.channel.type === 'dm') {
		const recipientThread = await Thread.findOne({ recipient: message.author.id, closed: false });
		if (!recipientThread) return open(client, message);

		dm(client, message, recipientThread);
	} else if (message.channel.type === 'text') {
		const recipientThread = await Thread.findOne({ channel: message.channel.id, closed: false });
		if (!recipientThread) return;
		if (message.content.endsWith('close') || message.content.endsWith('alert')) return;
		channel(client, message, recipientThread);
	}
};

