const {
	MessageEmbed
} = require('discord.js');
const {
	clashroyaletoken
} = require('../../config.json');
const {
	Client
} = require('../../utils/clashroyale/index');
const {
	stripIndents
} = require('common-tags');
const coc = new Client({
	token: clashroyaletoken
});
const { Permissions } = require('discord.js');

module.exports = {
	name: 'clash-royale-clan',
	description: 'Provides information about your Clash Royale clan',
	usage: '<clanTag>',
	example: '#YLQ9UUOG',
	category: 'Game',
	aliases: ['crc'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [],
	async execute({
		message,
		args
	}) {
		const tag = args[0];
		if (!tag) return message.channel.send('Please provide a tag!');
		const data = await coc.clan(tag).catch(err => {
			console.log(err);
			return {
				ok: false,
				status: err.code,
				name: err.message
			};
		});

		if (!data.ok && data.status === 404) {
			return message.channel.send('Please provide a valid Clash Royale tag!');
		}

		if (!data.ok && data.status !== 404) {
			return message.channel.send(`${data.reason}`);
		}
		const embed = new MessageEmbed()
			.setAuthor(`${data.name} `)
			.setColor(global.config.color)
			.setThumbnail('https://cdn.discordapp.com/avatars/704725852453208104/f865e9817d5f675a2abd3cc9de6178d3.png?size=2048')
			.setDescription(stripIndents`
		**[TH2](https://discord.gg/dusNMvr7ur)**

		**Description:**
		\`${data.description}\`

		**Tag:**
		\`${data.tag}\`

		**Type:**
		\`${data.type}\`

		**Members:**
		\`${data.members}/50\`

		**War Trophies:**
		\`${data.clanWarTrophies}\`

		**Location:**
		\`${data.location.name}\`

		**Clan Score:**
		\`${data.clanScore}\`

		**Clan chest status:**
		\`${data.clanChestStatus}\`

		**Clan chest level:**
		\`${data.clanChestLevel}\`

		**Required Trophies:**
		\`${data.requiredTrophies}\`

		**Donations per week:**
		\`${data.donationsPerWeek}\`

		
  `);

		return message.channel.send({
			embed
		});
	}

};
