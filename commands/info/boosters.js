const { Permissions, MessageEmbed } = require('discord.js');

module.exports = {
	name: 'boosters',
	description: 'List all server boosters.',
	usage: '',
	example: '',
	aliases: ['list-boosters', 'booster-list'],
	category: 'Utility',
	ownerOnly: false,
	clientPermissions: [Permissions.FLAGS.EMBED_LINKS, Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	async execute({ message }) {
		const boosters = await message.guild.members.cache.filter(member => member.premiumSince);
		let index = 0;

		let description;
		if (boosters.length <= 0) {
			description = 'This server does not have any server boosters!';
		} else {
			description = `${boosters.map(member => {
				index += 1;

				return `**${index}.** \`${member.user.tag}\``;
			}).join('\n')}`;
		}

		const embed = new MessageEmbed().setColor('#FF84F0').setDescription(description)
			.setTitle('Server Boosters')
			.setThumbnail('https://cdn.discordapp.com/attachments/739205938166104115/828285580576030750/EWdeUeHXkAQgJh7.png');
		message.channel.send(embed);
	}
};
