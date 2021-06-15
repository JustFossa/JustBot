const Discord = require('discord.js');
const moment = require('moment');
const { Permissions, MessageEmbed } = require('discord.js');
const emojis = require('../emojis/emojis');
const paginate = require('../../utils/paginate');

module.exports = {
	name: 'role-info',
	description: 'Displays information about the role',
	usage: '<mentionRole>',
	example: '@user',
	category: 'Utility',
	aliases: ['rinfo'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [],
	async execute({ message, client }) {
		const { guild } = message;

		const msg = await message.channel.send(client.embed('Which role would you like info on?'));
		const awaited = await message.channel.awaitMessages(
			msg => msg.author.id === message.author.id,
			{ max: 1, time: 60000, errors: ['time'] }
		).catch(() => null);

		if (!awaited) {
			return msg.edit(`${emojis.cross} The command timed-out, please type the command to try again!`, { embed: null });
		}

		const m = awaited?.first();
		await m.delete();
		if (m?.content?.toLowerCase() === 'stop') {
			return msg.edit(`${emojis.tick} Command successfully terminated!`, { embed: null });
		}

		const roleName = m.content;

		let role = guild.roles.cache.find(r => r.name === roleName);

		if (!role) {
			const roleId = m.content;
			if (!roleId) return msg.edit('Invalid role provided!', { embed: null });

			role = guild.roles.cache.get(roleId);

			if (!role) return msg.edit('Role not found!', { embed: null });
		}

		msg.delete();

		const embed = new Discord.MessageEmbed()
			.setColor(global.config.color)
			.setThumbnail(message.guild.iconURL({ format: 'png' }));

		embed.setColor(global.config.color)
			.setAuthor(`Role: ${role.name}`)
			.setDescription([
				'**[TH2 BOT](https://discord.gg/dusNMvr7ur)**',
				'',
				'**Role ID**',
				`\`${role.id}\``,
				'',
				'**Creation Date**',
				`\`${moment
					.utc(role.createdAt)
					.format('MMMM D, YYYY')}\``,
				'',
				'**Color**',
				`\`${role.hexColor.toUpperCase()}\`, \`${role.color}\``,
				'',
				'**Mentionable**',
				`\`${role.mentionable ? 'Yes' : 'No'}\``
			]);

		const users = [];
		role.members.forEach(member => {
			users.push(`• ${member.user.tag}`);
		});

		const pages = [
			embed
		];

		if (users) {
			for (let i = 0; i <= Math.ceil(users.length / 40); i++) {
				const index = i * 40;

				pages.push(new MessageEmbed().setColor(global.config.color).setTitle('Users with Role')
					.setDescription(users.slice(index, index + 40).join('\n')));
			}
		}

		await paginate(message, pages);
	}
};
