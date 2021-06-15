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
	name: 'clash-royale-player',
	description: 'Provides information about your Clash Royale profile',
	usage: '<playerTag>',
	example: '#U2QV2UO',
	category: 'Game',
	aliases: ['crp', 'crplayer'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [],
	async execute({
		message,
		args
	}) {
		const tag = args[0];
		if (!tag) return message.channel.send('Please provide a tag!');
		const data = await coc.player(tag).catch(err => {
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
            
        **Tag:**
        \`${data.tag}\`

        XP:
        \`${data.expLevel}\`
        
        **Cards collected:**
        \`${data.clanCardsCollected}\`

		**Role in clan:**
        \`${data.role}\`
        
        **3 crown wins:**
		\`${data.threeCrownWins}\`

		**Trophies:**
		\`${data.trophies}\`
		
		**Best trophies:**
		\`${data.bestTrophies}\`
		
		**Battle count:**
		\`${data.battleCount}\`
        
		**Donations**
		\`${data.donations}\`

		**Donations Received:**
		\`${data.donationsReceived}\`

		**War day wins:**
		\`${data.warDayWins}\`

	
  `);

		return message.channel.send({
			embed
		});
	}

};
