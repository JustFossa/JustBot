const { Permissions, MessageEmbed } = require('discord.js');
const emojis = require('../emojis/emojis');

module.exports = {
	name: 'check',
	description: 'Returns the specified users avatar',
	usage: '<userID>',
	example: '434693228189712385',
	ownerOnly: true,
	category: 'Owner Only',
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [],

	async execute({ message, args, client }) {
		const check = [];
		const userID = args[0]?.match(/\d+/)?.[0];

		const user = client.users.cache.get(userID);
		if (!user) {
			return message.channel.send(`${emojis.cross} User not found!`);
		}

		const guilds = [];
		for (const guild of client.guilds.cache.values()) {
			if (guild.members.cache.has(user.id)) {
				guilds.push(guild.name);
			}
		}

		client.guilds.cache.forEach(g => {
			if (g.ownerID === args[0]) {
				check.push('This user has invited the bot!');
			}
		});

		const embed = new MessageEmbed()
			.setColor(client.config.color)
			.setDescription([
				`**${guilds.length} Mutual Servers**`,
				`${guilds.map(name => `• \`${name}\``).join('\n')}`,
				'',
				'**Bot added**',
				check[0] ? '\`Yes\`' : '\`No\`'
			])
			.setTitle(`${user.tag}`);

		return message.channel.send({ embed });
	}
};
