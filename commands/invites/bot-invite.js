/*const Discord = require('discord.js');
const { Permissions } = require('discord.js');

module.exports = {
	name: 'bot-invite',
	description: 'Provides an invite to a bot',
	usage: '<mentionBot>',
	example: '@ClashPerk',
	category: 'Utility',
	aliases: ['invite'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [],
	async execute({ message, args }) {
		const botMention = message.mentions.users.first() || args[0];
		if (!botMention) {
			const embed = new Discord.MessageEmbed()
				.setColor(global.config.color)
				.setAuthor('Aeo Bot')
				.setImage('https://cdn.discordapp.com/attachments/724146808598560789/802902644108165170/Add_our_bot.png?size=1024')
				.setDescription(['<:link:799376179034456077> We welcome you to invite **Aeo** to your server!\n\n• **[Invite Aeo Here](https://Aeo.xyz/invite)**\n\n• [Support Server](https://discord.gg/m5GHTMR)\n• [Documentation](https://Aeo.gitbook.io/docs)']);
			return message.channel.send(embed);
		}

		if (!botMention.bot && !args[0]) return message.channel.send('<:Aeo_cross:809875437470875739> You must mention a bot!');

		return message.channel.send(`https://discord.com/oauth2/authorize?client_id=${botMention}&scope=bot&permissions=8`);
	}
};*/
