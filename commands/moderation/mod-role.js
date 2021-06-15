const { Permissions } = require('discord.js');
const emojis = require('../emojis/emojis');

module.exports = {
	name: 'mod-role',
	description: 'Set\'s the server\'s mod role',
	usage: '',
	example: '',
	category: 'Moderation',
	aliases: [''],
	modBypass: true,
	userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
	logs: true,
	async execute({ client, message, color, settings, utils: { settings: settingsManager } }) {
		client.config.hold.add(`${message.guild.id}:message_deleted`);
		await message.delete().catch(() => client.config.hold.delete(`${message.guild.id}:message_deleted`));

		const msg = await message.channel.send(client.embed('What role would you like to set as mod role?'));
		const awaited = await message.channel.awaitMessages(
			msg => msg.author.id === message.author.id,
			{ max: 1, time: 60000, errors: ['time'] }
		).catch(() => null);

		if (!awaited) {
			return msg.edit(`${emojis.cross} The command timed-out, please type the command to try again!`, { embed: null });
		}

		const m = awaited?.first();
		if (m?.content?.toLowerCase() === 'stop') {
			await m.delete();
			return msg.edit(`${emojis.tick} Command successfully terminated!`, { embed: null });
		}

		await m.delete();

		client.config.hold.add(`${message.guild.id}:message_deleted`);
		await message.delete().catch(() => client.config.hold.delete(`${message.guild.id}:message_deleted`));

		const { guild } = message;

		const roleName = m.content;

		let role = guild.roles.cache.find(r => r.name === roleName) || m.mentions.roles.first() || guild.roles.cache.find(r => r.id === m.content);

		if (!role) {
			const roleId = m.content;
			if (!roleId) return msg.edit('Invalid role provided!', { embed: null });

			role = guild.roles.cache.get(roleId);

			if (!role) return msg.edit('Role not found!', { embed: null });
		}

		guild.log({
			embeds: [{
				title: '**Mod role set**',
				description: `**Actioned By:**\n\`${message.author.tag}\`\n\n**Role:**\n\`${role.name}\``,
				color
			}]
		});

		settings.modRole = role.id;
		await settings.save();
		await settingsManager.setCache(settings);

		await msg.edit(`Successfully set the mod role to \`${role.name}\``, { embed: null });
		setTimeout(async () => {
			await msg.delete();
		}, 3000);
	}
};
