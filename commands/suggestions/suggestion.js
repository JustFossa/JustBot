const Suggestions = require('../../models/suggestions');
const Discord = require('discord.js');
const { Permissions } = require('discord.js');
const emojis = require('../emojis/emojis');

module.exports = {
	name: 'suggestion',
	description: 'Accept or deny a suggestion',
	usage: '',
	example: '',
	category: 'Utility',
	clientPermissions: [Permissions.FLAGS.MANAGE_CHANNELS, Permissions.FLAGS.ADD_REACTIONS, Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [Permissions.FLAGS.MANAGE_GUILD],

	async execute({ message, prefix, client }) {
		const msg = await message.channel.send(client.embed('Would you like to accept or deny a suggestion?'));
		const awaited = await message.channel.awaitMessages(
			msg => msg.author.id === message.author.id,
			{ max: 1, time: 60000, errors: ['time'] }
		).catch(() => null);

		if (!awaited) {
			return msg.edit(`${emojis.cross} The command timed-out, please type the command to try again!`, { embed: null });
		}

		const m = awaited?.first();
		if (m?.content?.toLowerCase() === 'stop') {
			await m?.delete();
			return msg.edit(`${emojis.tick} Command successfully stopped!`, { embed: null });
		}

		await m?.delete();
		await msg.edit(client.embed('Please provide the suggestion ID which is placed on the suggestion.'));
		const res = await message.channel.awaitMessages(
			msg => msg.author.id === message.author.id,
			{ max: 1, time: 30000, errors: ['time'] }
		).catch(() => null);

		if (!res) {
			return msg.edit(`The command timed-out, please type the command to try again!`, { embed: null });
		}

		const mText = res.first();
		if (mText?.content?.toLowerCase() === 'stop') {
			return msg.edit(`Command successfully stopped!`, { embed: null });
		}

		const suggestion = await Suggestions.findOne({
			suggestionID: mText.content
		});

		if (!suggestion) {
			return msg.edit(
				'You did not provide a valid suggestion ID.',
				{ embed: null }
			);
		}
		const editMessage = await message.guild.channels.cache
			.get(suggestion.channelID)
			.messages.cache.get(suggestion.messageID);

		if (!editMessage) return message.channel.send('Unable to find suggestion message'); // message not found
		const receivedEmbed = await editMessage.embeds[0];
		if (m.content === 'accept') {
			const updatedEmbed = new Discord.MessageEmbed()
				.setColor('#5DE67B')
				.setTitle(`Accepted: Suggestion by ${suggestion.name}`)
				.addField(
					'Suggestion',
					`\`\`\`${suggestion.suggestionText}\`\`\``
				)
				.setFooter(`Accepted by ${message.author.tag}`);
			await editMessage.edit({ embed: updatedEmbed });
			await msg.edit(
				`Accepted suggestion ${mText.content}.`,
				{ embed: null }
			);
			await editMessage.reactions.removeAll();
			await Suggestions.deleteOne({ suggestionID: mText.content });
			await mText.delete();
		} else if (m.content === 'deny') {
			const updatedEmbed = new Discord.MessageEmbed(receivedEmbed)
				.setColor('#FC5C5C')
				.setTitle(`Denied: Suggestion by ${suggestion.name}`)
				.addField(
					'Suggestion',
					`\`\`\`${suggestion.suggestionText}\`\`\``
				)
				.setFooter(`Denied by ${message.author.tag}`);
			await editMessage.edit({ embed: updatedEmbed });
			await message.channel.send(
				`Denied suggestion ${mText.content}.`,
				{ embed: null }
			);
			await editMessage.reactions.removeAll();
			await Suggestions.deleteOne({ suggestionID: mText.content });
			await mText.delete();
		} else {
			return msg.edit(
				`You did not provide a valid argument. \nThe proper usage would be: \`${prefix}${this.name} ${this.usage}\``,
				{ embed: null }
			);
		}
	}
};
