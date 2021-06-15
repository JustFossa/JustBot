const FastSet = require('@non-hacker/collections/fast-set');
const EmojiRegex = require('emoji-regex')();
const Discord = require('discord.js');
const { Permissions } = require('discord.js');
const snowflakeRegex = /^\d{17,19}$/;
const messageLinkRegex = /https?:\/\/discord(app)?\.com\/channels\/(\d{17,19})\/(\d{17,19})\/(\d{17,19})/;
const CustomEmojiRegex = /<?(a)?:?(\w{2,32}):(\d{17,19})>?/g;
const usersUsing = new FastSet();

const time = 2 * 60 * 1000;

const execute = async ({
	message,
	args,
	client,
	utils,
	settings
}) => {
	const {
		channel,
		guild,
		author,
		member
	} = message;

	const embed = new Discord.MessageEmbed({
		title: 'Please enter a message ID or link',
		color: client.config.color,
		footer: {
			text: 'Type "stop" to terminate the process'
		}
	});

	const responseMessage = await channel.send(embed);

	async function sendStop() {
		await responseMessage.delete();
		await channel.temp('Process terminated successfully', { time: 3000 });
	}

	async function doStop(content) {
		if (content === 'stop') {
			await sendStop();
			return true;
		}
		return false;
	}

	let response;
	try {
		response = (await channel.awaitMessages(collectedMessage =>
			utils.samePerson(author, collectedMessage), {
			max: 1,
			time,
			errors: ['time']
		})).first();
	} catch (err) {
		return sendStop();
	}
	await response.delete();
	if (await doStop(response.content)) return;

	const msg = response.content;

	let messageID;
	let channelID;

	// get channelID/messageID from message id or message link
	if (!snowflakeRegex.test(msg)) {
		const messageLink = msg.match(messageLinkRegex);
		if (messageLink) {
			channelID = messageLink[3];
			messageID = messageLink[4];
		} else {
			return message.channel.temp('Please provide a real message id or message link');
		}
	} else {
		messageID = msg;
		embed.setTitle('Please mention the channel the message is in');
		responseMessage.edit(embed);
		let collectedMessages;
		try {
			collectedMessages = await channel.awaitMessages(collectedMessage => {
				if (!utils.samePerson(author, collectedMessage)) return false;
				return true;
			}, {
				max: 1,
				time,
				errors: ['time']
			});
		} catch (err) {
			return sendStop();
		}

		const collectedMessage = collectedMessages.first();
		collectedMessage.delete();

		if (await doStop(collectedMessage.content)) return;

		const channelIDMatch = collectedMessage.content.match(/\d+/);
		if (!channelIDMatch) return channel.send('Please provide a valid channel');

		channelID = channelIDMatch[0];
	}

	// check if message/channel/role exists
	const reactionChannel = guild.channels.cache.get(channelID);
	if (!reactionChannel) return channel.send('Channel not found');

	let reactionMessage;
	try {
		reactionMessage = await reactionChannel.messages.fetch(messageID);
	} catch (err) {
		if (err.httpStatus === 404) return message.channel.send('Message not found');
		else if (err.httpStatus === 403) return message.channel.send('I cannot see that channel');
		throw err;
	}


	let reactionRole = settings.reactionRoles.find(r => r.messageID === messageID);

	if (!reactionRole) {
		embed.setTitle('Please provide an emoji!');
		responseMessage.edit(embed);

		let emojiMessage;

		try {
			emojiMessage = (await channel.awaitMessages(collectedMessage => utils.samePerson(author, collectedMessage), {
				max: 1,
				time,
				errors: ['time']
			})).first();
		} catch (err) {
			return sendStop();
		}

		emojiMessage.delete();

		if (await doStop(emojiMessage.content)) return;

		const emojis = [...emojiMessage.content.match(EmojiRegex) || []].concat([...emojiMessage.content.matchAll(CustomEmojiRegex) || []].map(e => e[3]));

		if (emojis.length < 1) return channel.send('Please provide an emoji!');

		const emoji = emojis.shift();

		embed.setTitle('Finally please mention the role!');
		responseMessage.edit(embed);

		let roleIDMessage;
		try {
			roleIDMessage = (await channel.awaitMessages(collectedMessage => utils.samePerson(author, collectedMessage), {
				max: 1,
				time,
				errors: ['time']
			})).first();
		} catch (err) {
			return sendStop();
		}
		client.config.hold.add(`${message.guild.id}:message_deleted`);
		roleIDMessage.delete();

		if (await doStop(roleIDMessage)) return;

		const roleIDMatch = roleIDMessage.content.match(/\d+/);
		if (!roleIDMatch) return channel.send('Please provide a valid role!');

		const roleID = roleIDMatch.shift();

		if (!guild.roles.cache.get(roleID)) return channel.send('Role not found!');

		reactionRole = { channelID, messageID, reaction: emoji, roleID };
		settings.reactionRoles.push(reactionRole);
		await utils.settings.save(settings);
		responseMessage.delete();
		message.channel.send('Reaction role successfully added!');
		reactionMessage.react(emoji);
	} else {
		const reactionIndex = settings.reactionRoles.findIndex(r => r.messageID === reactionMessage.id);
		if (reactionIndex > -1) {
			settings.reactionRoles.splice(reactionIndex, 1);
			await utils.settings.save(settings);
			channel.send('Reaction role successfully removed!');
		} else {
			channel.send('Reaction role not found!');
		}
	}
};

module.exports = {
	name: 'reaction-roles',
	description: 'Sets up reaction roles for the current server',
	usage: '',
	example: '',
	category: 'Utility',
	aliases: ['reactionroles', 'reactionrole', 'setup-roles', 'reaction'],
	clientPermissions: [Permissions.FLAGS.ADD_REACTIONS, Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
	async execute({
		message
	}) {
		message.delete();

		const usingNamespace = `${message.channel.id}:${message.author.id}`;
		if (usersUsing.has(usingNamespace)) return message.channel.send('Editor already open');
		usersUsing.add(usingNamespace);
		try {
			// eslint-disable-next-line prefer-rest-params
			await execute(...arguments);
		} catch (err) {
			usersUsing.remove(usingNamespace);
			throw err;
		}
		usersUsing.remove(usingNamespace);
	}
};
