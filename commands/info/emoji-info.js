const { Message, MessageEmbed, GuildEmoji } = require('discord.js');
const moment = require('moment');
const emojis = require('node-emoji');
const punycode = require('punycode');
const { stripIndents } = require('common-tags');
const { Permissions } = require('discord.js');
const EMOJI_REGEX = /<(?:a)?:(?:\w{2,32}):(\d{17,19})>?/;
const emojisem = require('../emojis/emojis');

module.exports = {
	name: 'emoji-info',
	description: 'Displays inforation about the emoji',
	usage: '<emoji>',
	example: ':blush:',
	category: 'Utility',
	aliases: ['einfo', 'ei'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [],
	/**
	 *
	 * @param {Object} params - The parameters
	 * @param {Message} params.message - The Message Object
	 * @param {Array<any>} params.args - The arguments provided
	 * @returns {Promise<Message>}
	 */

	async execute({ message, client }) {
		const msg = await message.channel.send(client.embed('Which emoji would you like info on?'));
		const awaited = await message.channel.awaitMessages(
			msg => msg.author.id === message.author.id,
			{ max: 1, time: 60000, errors: ['time'] }
		).catch(() => null);

		if (!awaited) {
			return msg.edit(`${emojisem.cross} The command timed-out, please type the command to try again!`, { embed: null });
		}

		const m = awaited?.first();
		await m.delete();
		if (m?.content?.toLowerCase() === 'stop') {
			return msg.edit(`${emojisem.tick} Command successfully terminated!`, { embed: null });
		}

		const emoji = this.parseEmoji(message, m.content);
		if (!emoji) return msg.edit('Please enter a valid emoji!', { embed: null });

		const embed = new MessageEmbed()
			.setColor(global.config.color);

		if (emoji instanceof GuildEmoji) {
			embed
				.setThumbnail(emoji.url)
				.setDescription(stripIndents`
				**[TH2](https://discord.gg/dusNMvr7ur)**

				**Name**
				\`${emoji.name}\`

				**Identifier**
				\`<${emoji.animated ? '' : ':'}${emoji.identifier}>\`

				**Creation Date** 
				\`${moment.utc(emoji.createdAt).format('MMMM D, YYYY')}\`

				<:link:799376179034456077> **URL**
				[Emoji Link](${emoji.url})
				`);
		} else {
			embed
				.setDescription(stripIndents`
					**[TH2](https://discord.gg/dusNMvr7ur)**

					**Name**
					${emoji.key}

					**Emoji**
					${emoji.emoji}

					**Raw**
					\\${emoji.emoji}

					**Unicode**
					${punycode.ucs2.decode(emoji.emoji).map(e => `\\u${e.toString(16).toUpperCase().padStart(4, '0')}`).join('')}
				`);
		}

		return msg.edit({ embed });
	},

	/**
	 *
	 * @param {Message} message - The message object
	 * @param {string} phrase - The emoji string
	 * @returns {GuildEmoji}
	 */
	parseEmoji(message, phrase) {
		if (EMOJI_REGEX.test(phrase)) [, phrase] = phrase.match(EMOJI_REGEX);
		if (!isNaN(phrase)) return message.guild.emojis.cache.get(phrase);
		const emoji = emojis.find(phrase);
		if (emoji) return emoji;
		return message.guild.emojis.cache.find(e => e.name.toLowerCase() === phrase);
	}
};
