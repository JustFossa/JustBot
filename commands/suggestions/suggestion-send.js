const Discord = require('discord.js');
const Suggestions = require('../../models/suggestions');
const { Permissions } = require('discord.js');
const emojis = require('../emojis/emojis');

function makeID(length) {
	let result = '';
	const characters = '0123456789';
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(
			Math.floor(Math.random() * charactersLength)
		);
	}
	return `#${result}`;
}

async function check(ID) {
	let suggestionCheck = await Suggestions.findOne({
		suggestionID: ID
	});
	while (suggestionCheck) {
		ID = makeID(5);
		suggestionCheck = await Suggestions.findOne({
			suggestionID: ID
		});
		check();
	}
}

module.exports = {
	name: 'send-suggestion',
	description: 'Send a suggestion',
	example: '',
	aliases: ['suggest'],
	usage: '',
	category: 'Utility',
	clientPermissions: [Permissions.FLAGS.MANAGE_CHANNELS, Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.ADD_REACTIONS],
	userPermissions: [],

	async execute({ message, color, client, settings }) {
		const msg = await message.channel.send(client.embed('What would you like to suggest?'));
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
			return msg.edit(`${emojis.tick} Command successfully terminated!`, { embed: null });
		}

		const ID = makeID(5);
		let suggestion = await Suggestions.findOne({ suggestionID: ID });
		if (suggestion) {
			await check(ID);
		}

		if (!settings.suggestionChannelID) {
			return msg.edit(
				'You must set a suggestion channel to use this command.',
				{ embed: null }
			);
		}

		await message.react('📨').then(
			message.delete({
				timeout: 3000
			})
		);

		const embed = new Discord.MessageEmbed()
			.setColor(color)
			.setTitle(`Pending: Suggestion by ${message.author.username}`)
			.addFields([
				{
					name: 'Suggestion',
					value: `\`\`\`${m.content}\`\`\``
				},
				{
					name: 'ID',
					value: `\`${ID}\`\n\nLike - <:tick:836263316540227646> | Dislike - <:cross:839947260501819402>

					**[TH2](https://discord.gg/dusNMvr7ur)**`
				}
			]);
		await message.guild.channels.cache.get(settings.suggestionChannelID)?.send(embed)
			.then(async sentMessage => {
				suggestion = new Suggestions({
					suggestionID: ID,
					channelID: sentMessage.channel.id,
					messageID: sentMessage.id,
					name: message.author.username,
					suggestionText: m.content
				});
				await suggestion.save();
				await sentMessage.react('836263316540227646');
				await sentMessage.react('839947260501819402');
			});

		await m?.delete();
		return msg.edit(`${emojis.tick} Suggestion successfully sent!`, { embed: null });
	}
};
