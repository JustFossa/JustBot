/*const Discord = require('discord.js');
const { stripIndents } = require('common-tags');
require('moment-duration-format');
const moment = require('moment');
const os = require('os');
const paginate = require('../../utils/paginate');
const { Permissions } = require('discord.js');
const { version } = require('../../package.json');
const Settings = require('../../models/settings');
const { commandError, commandStats } = require('../../models/Usage');
const Thread = require('../../models/thread');
const guildBlacklist = require('../../models/guildBlacklist');
const blacklist = require('../../models/blacklist');

module.exports = {
	name: 'bot-info',
	description: 'Gives info about the bot',
	usage: '',
	example: '',
	aliases: ['binfo'],
	category: 'Owner Only',
	ownerOnly: true,
	clientPermissions: [Permissions.FLAGS.EMBED_LINKS, Permissions.FLAGS.USE_EXTERNAL_EMOJIS],

	async execute({ message, client }) {
		const embed = new Discord.MessageEmbed();
		const memory = process.memoryUsage().heapUsed / 1024 / 1024;

		const currentTime = new Date();
		currentTime.setUTCDate(0);
		currentTime.setUTCHours(0, 0, 0, 0);

		const errors = (await commandError.aggregate([
			{
				$match: {
					timestamp: { $gt: currentTime }
				}
			},
			{
				$group: {
					_id: null,
					count: {
						$sum: '$count'
					}
				}
			}
		]).exec())[0]?.count ?? 0;

		const commands = await commandStats.find().sort({ uses: -1 }).limit(10);

		let users = 0;
		for (const i of message.client.guilds.cache.values()) {
			users += i.memberCount;
		}

		embed.setColor(global.config.color);
		embed.setAuthor('Aeo Info')
			.setThumbnail(message.client.user.displayAvatarURL({ format: 'png' }))
			.setDescription(stripIndents`
        <:tag:717436253649502250> **Library**
        \`discord.js\`

        <:profile:717437038646788137> **Owner**
		\`RCツ#0002\`

		<:timer:717436253762486302> **Created**
		\`23rd Dec 2019\`

        <:authorise:717436996229922937> **Memory**
        \`${Math.round(memory)}MB / 4GB\`

        <:bell:717437129017524324> **Ping**
        \`${message.client.ws.ping}ms\`

        <:bell:717437129017524324> **Uptime**
		\`${moment.duration(process.uptime() * 1000).format('H [hrs]', { trim: 'both mid' })}\`

		<:ban:799375370914234388> **Commands**
		\`${client.commands.size}\`

        <:growth:812057608420589678> **Servers**
		\`${message.client.guilds.cache.size}\`

        <:members:717436253364289667> **Members**
		\`${users}\`

		<:gears:717436253376872500> **Bot Version**
		\`v${version}\`

		<:gears:717436253376872500> **Discord.js**
		\`v${Discord.version}\`

		<:gears:717436253376872500> **Node.js**
		\`${process.version}\`
      `);

		const pages = [
			embed,
			new Discord.MessageEmbed()
				.setColor(global.config.color)
				.setAuthor('Aeo Channel Stats')
				.setThumbnail(message.client.user.displayAvatarURL({ format: 'png' }))
				.setDescription([
					'<:message:798994744649711673> **ModMail Setups**',
					`\`${await Settings.countDocuments({ modMailSystem: { $exists: true } })}\``,
					'',
					'<:list:717436253402038274> **Welcome Setups**',
					`\`${await Settings.countDocuments({ welcome: { $exists: true } })}\``,
					'',
					'<:channel:717436253540188221> **Total Channels**',
					`\`${client.channels.cache.size}\``,
					'',
					'<:channel:717436253540188221> **Economy Channels**',
					`\`${await Settings.countDocuments({ economyChannelID: { $exists: true } })}\``,
					'',
					'<:channel:717436253540188221> **Moderation Channels**',
					`\`${await Settings.countDocuments({ logChannelID: { $exists: true } })}\``,
					'',
					'<:channel:717436253540188221> **Suggestion Channels**',
					`\`${await Settings.countDocuments({ suggestionChannelID: { $exists: true } })}\``,
					'',
					'<:channel:717436253540188221> **ModMail Channels**',
					`\`${await Thread.countDocuments({ closed: false })}\``,
					'',
					'<:channel:717436253540188221> **Tickets opened**',
					`\`${await Thread.countDocuments({ 'ticketSystem.enabled': true })}\``
				]),
			new Discord.MessageEmbed()
				.setColor(global.config.color)
				.setAuthor('Aeo Channel Stats')
				.setThumbnail(message.client.user.displayAvatarURL({ format: 'png' }))
				.setDescription([
					'<:authorise:717436996229922937> **Errors this month**',
					`\`${errors}\``,
					'',
					'<:profile:717437038646788137> **Blacklisted users**',
					`\`${await blacklist.countDocuments({ active: true })}\``,
					'',
					'<:security:717436896506151023> **Blacklisted Guilds**',
					`\`${await guildBlacklist.countDocuments({ active: true })}\``,
					'',
					'<:ban:799375370914234388> **10 Most Used Commands**',
					`${commands.map((cmd, i) => `\`\u200e${(++i).toString().padEnd(2, ' ')} ${cmd.name.padEnd(16, ' ')} \u200f\``).join('\n')}`
				])
		];

		return paginate(message, pages);
	},

	get freemem() {
		return os.freemem() / (1024 * 1024);
	}
};*/
