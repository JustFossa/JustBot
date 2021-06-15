const ms = require('ms');

module.exports = {
	name: 'mass-removerole',
	description: 'Removes a role from all the members in the server',
	usage: '<mentionRole>',
	example: '@community',
	aliases: ['massrr'],
	category: 'Owner Only',
	args: true,
	logs: true,
	async execute({ message, settings, utils: { settings: settingsManager }, args, color, config, client }) {
		// if (message) return message.channel.send('<:Aeo_cross:809875437470875739> This command is under maintenance, please try again later!');

		config.hold.add(`${message.guild.id}:message_deleted`);
		await message.delete().catch(() => config.hold.delete(`${message.guild.id}:message_deleted`));

		// if (message.guild.memberCount >= 250) return message.channel.send('<:Aeo_cross:809875437470875739> Too large server!');

		const { member, channel, guild, author } = message;
		const { 0: roleArg } = args;
		if (!client.isOwner(message.author.id)) return channel.temp('You must be a bot administrator to use this command!');

		if (!Object.values(config.owners).includes(message.author.id) && settings.massRoleTimestamp.getTime() > Date.now()) return channel.temp(`<:timer:717436253762486302> Please wait another ${ms(settings.massRoleTimestamp.getTime() - Date.now())}`);

		const roleName = args.join(' ');

		let role = guild.roles.cache.find(r => r.name === roleName);

		if (!role) {
			const roleIdMatch = roleArg.match(/\d+/);
			if (!roleIdMatch) return channel.temp('Invalid role provided!');

			const roleId = roleIdMatch[0];

			role = guild.roles.cache.get(roleId);

			if (!role) return channel.temp('Role not found!');
		}

		const permissionDiff = guild.me.roles.highest.comparePositionTo(role);
		if (permissionDiff < 0) {
			return message.channel.temp('I can\'t remove a higher role!');
		} else if (permissionDiff === 0) {
			return message.channel.temp('I can\'t remove a equal role!');
		}

		if (member.id !== guild.ownerID) {
			if (permissionDiff < 0) {
				return message.channel.temp('You can\'t remove a higher role!');
			} else if (permissionDiff === 0) {
				return message.channel.temp('You can\'t remove a equal role!');
			}
		}

		let members;

		try {
			members = (await guild.members.fetch()).filter(m => m.roles.cache.some(r => r.id === role.id));
		} catch (err) {
			console.error(err);
			return channel.temp('Failed to fetch members!');
		}

		const result = await Promise.allSettled(members.map(member => member.roles.remove(role)));

		const succesfull = result.filter(res => res.status === 'fulfilled').length;
		const failed = result.filter(res => res.status === 'rejected').length;

		channel.temp(`Roles removed. **${succesfull}** succesfull, **${failed}** failed.`);

		guild.log({
			embeds: [{
				title: '**Mass Role Removed**',
				description: `**Actioned by:**\n\`${author.tag}\`\n\n**Role:**\n\`${role.name}\``,
				color
			}]
		});

		const timestamp = new Date();
		timestamp.setHours(timestamp.getHours() + 24);
		settings.massRoleTimestamp = timestamp;
		await settings.save();
		settingsManager.setCache(settings);

		const masterLogger = client.channels.cache.get('835614920681717761');
		if (masterLogger) {
			return masterLogger.send({
				embed: {
					title: 'Mass Remove Role',
					description: [
						'**Actioned by:**',
						`\`${message.author.tag}\``,
						'',
						'**Guild:**',
						`\`${guild.name}\``,
						'',
						'**Role:**',
						`\`${role.name}\``
					].join('\n'),
					color: global.config.color
				}
			});
		}
	}
};
