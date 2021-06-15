/* eslint-disable eqeqeq */
/* eslint-disable no-throw-literal */
/* eslint-disable prefer-promise-reject-errors */
const BadWords = require('bad-words');
const EmojiRegex = require('emoji-regex')();

const autoFilter = new BadWords({
	exclude: require('../excludes.json')
});

const linkReg = /https?:\/\/([^.]+\.?){2,}/;

async function isLink(message) {
	const { cleanContent, content, author, guild, channel } = message;
	if (linkReg.test(content)) {
		guild.log({
			embeds: [{
				title: '**Link sent**',
				description: `${'**User:**\n' +
					`\`${author.tag}\`\n\n` +
					'**Channel:**\n'}${channel.toString()}\n\n` +
					'**Message:**\n' +
					`\`${cleanContent}\``,
				color: global.color
			}]
		});
		message.channel.temp(`${message.author.tag} links are not allowed here`, { time: 20000 });
		return Promise.reject(false);
	}
	return true;
}

async function badWord(message) {
	const { cleanContent, content, author, guild, channel } = message;
	if (autoFilter.isProfane(content)) {
		guild.log({
			embeds: [{
				title: '**Swear**',
				description: `${'**User:**\n' +
					`\`${author.tag}\`\n\n` +
					'**Channel:**\n'}${channel.toString()}\n\n` +
					' **Message:**\n' +
					`\`${cleanContent}\``,
				color: global.color
			}]
		});
		message.channel.temp(` No swearing allowed here ${message.author.tag}`, { time: 20000 });
		return Promise.reject(false);
	}
	return true;
}

const MentionRegex = /<@[!&]?(\d{17,19})>/g;
// const UserRegex = /<@!?(\d{17,19})>/g;
// const RoleRegex = /<@&(\d{17,19})>/g;
const Discord = require('discord.js');

const MaxMentions = 2;
const MaxDiffMentions = 3;

function duplicateReducer(accumulator, value) {
	const id = value[1];
	return accumulator.set(id, (accumulator.get(id) || 0) + 1);
}

function duplicates(arr) {
	return arr.reduce(duplicateReducer, new Discord.Collection());
}

async function massMention(message) {
	const { cleanContent, mentions, channel, guild, author, member } = message;
	const diffMentions = mentions.members.size + mentions.roles.size;
	if (diffMentions > MaxDiffMentions) {
		guild.log({
			embeds: [{
				title: '**Max different mentions**',
				description: '**User:**\n' +
					`\`${author.tag}\`\n\n` +
					'**Message:**\n' +
					`\`${cleanContent}\`\n\n`,
				color: global.color
			}]
		});

		global.config.hold.add(`${guild.id}:message_deleted`);
		channel.temp(` **${member.user.tag}** do not spam tag`, { time: 20000 });
		throw false;
	}

	// const allMessageMention = mentions.members.concat(mentions.roles);

	const allMentions = [...message.content.matchAll(MentionRegex)];

	const duplicateMentions = duplicates(allMentions);

	if (duplicateMentions.some(m => m > MaxMentions)) {
		guild.log({
			embeds: [{
				title: '**Max mentions**',
				description: '**User:**\n' +
					`\`${author.tag}\`\n\n` +
					'**Message:**\n' +
					`\`${cleanContent}\`\n\n`,
				color: global.color
			}]
		});

		global.config.hold.add(`${guild.id}:message_deleted`);
		channel.temp(` **${member.user.tag}** do not spam tag`, { time: 20000 });
		throw false;
	}
	return true;
}

const lastMessages = new Discord.Collection();

async function duplicateMessage(message) {
	const { cleanContent, content, channel, member, guild, author } = message;
	let lastMessage;
	if ((lastMessage = lastMessages.get(`${member.id}:${channel.id}`)) && !lastMessage.deleted && lastMessage.content == content) {
		guild.log({
			embeds: [{
				title: '**Duplicate message**',
				description: '**User:**\n' +
					`\`${author.tag}\`\n\n` +
					'**Message:**\n' +
					`\`${cleanContent}\``,
				color: global.color
			}]
		});
		global.config.hold.add(`${guild.id}:message_deleted`);
		channel.temp(` **${member.user.tag}** do not spam here`, { time: 20000 });
		throw false;
	} else {
		lastMessages.set(`${member.id}:${channel.id}`, message);
	}
	return true;
}

const CustomEmojiRegex = /<?(?:(a):)?(\w{2,32}):(\d{17,19})?>?/g;

const MaxEmojis = 3;

async function emojiSpam(message) {
	const { cleanContent, content, channel, guild, author, member } = message;
	const emojis = [...content.match(EmojiRegex) || []].concat([...content.match(CustomEmojiRegex) || []]);
	if (emojis.length > MaxEmojis) {
		guild.log({
			embeds: [{
				title: '**Emoji spam**',
				description: '**User:**\n' +
					`\`${author.tag}\`\n\n` +
					'**Message:**\n' +
					`\`${cleanContent}\``,
				color: global.color
			}]
		});

		global.config.hold.add(`${guild.id}:message_deleted`);
		channel.temp(` **${member.user.tag}** do not spam emojis here`, { time: 20000 });
		throw false;
	}
	return true;
}

const checkCaps = (msg = '') => /^[A-Z]*$/.test(msg) && msg.length >= 20;

async function massCaps(message) {
	if (!checkCaps(message.content)) return true;
	message.guild.log({
		embeds: [{
			title: '**Caps Spam**',
			description: '**User:**\n' +
				`\`${message.author.tag}\`\n\n` +
				'**Message:**\n' +
				`\`${message.cleanContent}\``,
			color: global.color
		}]
	});

	message.channel.temp(` **${message.author.tag}** do not spam here`, { time: 20000 });
	global.config.hold.add(`${message.guild.id}:message_deleted`);
	throw false;
}

async function autoMod(message, settings) {
	const checks = [];
	if (message.member?.permissions.any(['ADMINISTRATOR', 'MANAGE_GUILD', 'MANAGE_ROLES', 'MANAGE_CHANNELS', 'BAN_MEMBERS', 'KICK_MEMBERS'])) return;
	if (!settings.autoMod) return Promise.resolve(false);
	if (settings.autoMod.links) checks.push(isLink(message));
	if (settings.autoMod.swearing) checks.push(badWord(message));
	if (settings.autoMod.massMention) checks.push(massMention(message));
	if (settings.autoMod.duplicateText) checks.push(duplicateMessage(message));
	if (settings.autoMod.emojiSpam) checks.push(emojiSpam(message));
	if (settings.autoMod.massCaps) checks.push(massCaps(message));
	return Promise.all(checks)
		.then(() => false)
		.catch(err => {
			if (err == false) {
				message.delete().catch(() => null);
				return true;
			}

			console.error(err);
		});
}

module.exports = {
	name: 'automod',
	construct() {
		return {
			isLink,
			badWord,
			massMention,
			duplicateMessage,
			emojiSpam,
			autoMod
		};
	}
};
