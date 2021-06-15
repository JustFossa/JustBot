const Warns = require('../../models/warns');
const { MessageEmbed, Permissions } = require('discord.js');

module.exports = {
	name: 'user-warns',
	description: 'Checks the amount of warns a user has',
	usage: '<userID>',
	example: '434693228189712385',
	category: 'Moderation',
	aliases: ['warnings', 'warns'],
	modBypass: true,
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [],
	async execute({ message, args, color }) {
		const { guild, member, channel } = message;

		if (args.length < 1) return message.channel.send('Please mention a user or provide a user ID!');

		const userIdMatch = args[0].match(/\d+/);
		if (!userIdMatch) return message.channel.send('Invalid user provided!');

		const userId = userIdMatch[0];


		let memberWarns;
		try {
			memberWarns = await guild.members.fetch(userId);
			if (member.id !== guild.ownerID) {
				const permissionDiff = member.roles.highest.comparePositionTo(memberWarns.roles.highest);
				if (permissionDiff < 0) {
					return message.channel.temp('You can\'t view warns someone with higher role!');
				} else if (permissionDiff === 0) {
					return message.channel.temp('You can\'t view warns someone with equal role!');
				}
			}
		} catch (err) {
			if (err && err.httpStatus === 404) return message.channel.send('This user was not found!');
			throw err;
		}

		const userWarns = await Warns.findOne({ id: memberWarns.id });

		let warns;
		if (userWarns) {
			warns = userWarns.warns;
		} else {
			warns = [];
		}

		const embed = new MessageEmbed({
			title: 'Warnings for:',
			description: `**${memberWarns.user.tag}**\n\n${warns.map((warn, index) => `**${index + 1}.** \`${warn.reason}\``).join('\n')}`,
			color
		});
		channel.send(embed);
	}
};
