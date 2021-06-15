const Discord = require('discord.js');
const { Permissions } = require('discord.js');
module.exports = {
	name: 'modmail',
	description: 'This command sets up Modmail for you in your server.',
	usage: '',
	example: '',
	category: 'ModMail',
	aliases: ['mail'],
	clientPermissions: [Permissions.FLAGS.MANAGE_CHANNELS, Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [Permissions.FLAGS.MANAGE_GUILD, Permissions.FLAGS.MANAGE_CHANNELS],
	logs: true,
	async execute({ client, message, settings, utils: { settings: settingsManager } }) {
		message.delete().catch(() => null);
		const { guild } = message;

		let categoryChannelID = settings?.modMailSystem?.categoryID;
		if (!client.channels.cache.has(categoryChannelID)) {
			categoryChannelID = (await guild.channels.create('📨 modmail', {
				type: 'category',
				permissionOverwrites: [
					{
						id: guild.id,
						deny: 'VIEW_CHANNEL'
					},
					{
						id: client.user,
						allow: 'VIEW_CHANNEL'
					},
					{
						id: message.author,
						allow: 'VIEW_CHANNEL'
					}
				]
			})).id;
		}

		settings.modMailSystem = {
			categoryID: categoryChannelID
		};

		const channel = await message.guild.channels.create('modmail', {
			parent: categoryChannelID,
			permissionOverwrites: [
				{
					id: guild.id,
					deny: 'VIEW_CHANNEL'
				},
				{
					id: client.user,
					allow: 'VIEW_CHANNEL'
				},
				{
					id: message.author,
					allow: 'VIEW_CHANNEL'
				}
			]
		});

		const embed = new Discord.MessageEmbed()
			.setColor(client.config.color)
			.setTitle('Welcome to ModMail')
			.setImage('https://cdn.discordapp.com/attachments/833331192446320650/836248393805987873/image0.png')
			.setDescription('ModMail is aimed to help server admins contact their members with ease!\n\n**Commands**\n• **`!open-thread`**\n• **`!alert`**\n• **`!close`**\n\n**Links**\n• **[Discord](https://discord.gg/Kb5MquFVwa)**\n•');
		await channel.send(message.author, { embed });

		await settingsManager.save(settings);
		return message.channel.send('Modmail system successfully enabled!');
	}
};
