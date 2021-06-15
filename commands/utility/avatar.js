const Discord = require('discord.js');
const { Permissions } = require('discord.js');
module.exports = {
	name: 'avatar',
	description: 'Returns the specified users avatar',
	usage: '<userID>',
	example: '434693228189712385',
	category: 'Utility',
	aliases: ['av', 'pfp'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [],
	async execute({ message, args }) {
		const embed = new Discord.MessageEmbed();

		const matches = args[0]?.match(/\d+/) || [message.author.id];
		const user = await message.client.users.fetch(matches[0]).catch(() => null);
		if (!user) return message.channel.send('Please provide a valid user!');

		embed.setColor(global.config.color).setTitle(`${user.tag}'s Avatar`).setDescription(`[PNG](${user.displayAvatarURL({ format: 'png', size: 2048 })}) | [JPEG](${user.displayAvatarURL({ format: 'jpeg', size: 2048 })})`)
			.setImage(user.displayAvatarURL({dynamic: true, format: 'png', size: 2048 }));

		return message.channel.send(embed);
	}
};
