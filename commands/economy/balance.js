const economyUser = require('../../models/economy');
const { MessageEmbed } = require('discord.js');
const { Permissions } = require('discord.js');

module.exports = {
	name: 'view-balance',
	description: 'This command allows you to check someones or your own balance for the economy system',
	usage: '<mentionUser>',
	example: '@Xenfo#0001',
	category: 'Economy',
	aliases: ['bal', 'bank', 'rank', 'balance', 'coins', 'points'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [],

	async execute({ message, args, settings, prefix }) {
		if (!settings.economyChannelID) return message.channel.send(`You must setup an economy channel in order to use this command!\n\n\`\`\`${prefix}seteconomy <mentionChannel>\`\`\``, { embed: null });
		if (settings.economyChannelID && message.channel.id !== settings.economyChannelID) return message.channel.send(`You may only use this command in <#${settings.economyChannelID}>`);

		try {
			const member = message.guild.member(args[0]?.match(/\d+/)?.[0] ?? message.author.id);
			economyUser.findOne({ userID: member.id }, (err, user) => {
				if (err) console.log(err);
				let money = 0;
				let cash = 0;
				if (user) {
					money = user.balance ? user.balance : 0;
					cash = user.cash ? user.cash : 0;
				}
				const embed = new MessageEmbed()
					.setAuthor(`${member.user.tag} balance`, member.user.displayAvatarURL())
					.setColor(global.config.color)
					.setDescription([
						'**Cash:**',
						`\`${cash}\``,
						// '',
						'**Bank:**',
						`\`${money}\``,
						// '',
						'**Net worth:**',
						`\`${cash + money}\``
					]);

				return message.channel.send({ embed });
			});
		} catch {
			return message.channel.send('You must mention a user or provide a valid ID!');
		}
	}
};
