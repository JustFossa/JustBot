module.exports = async (client, reaction, user) => {
	if (reaction.message.deleted) return;
	if (reaction.message.partial) await reaction.message.fetch().catch(() => null);
	if (reaction.partial) await reaction.fetch().catch(() => null);

	if (user.bot) return;
	const message = reaction.message;
	const { guild, channel } = message;
	if (channel.type !== 'text') return;

	const settings = await client.utils.settings.fetch(guild.id);

	const reactionRole = settings.reactionRoles.find(r => r.messageID === message.id);
	if (!reactionRole || reactionRole.reaction !== (reaction.emoji.id || reaction.emoji.name)) return;

	const role = guild.roles.cache.get(reactionRole.roleID);
	if (!role) return;

	const member = await guild.members.fetch(user).catch(() => null);
	if (!member) return;

	if (member.roles.cache.has(role.id)) return;
	if (!member.guild.me?.permissions.has('MANAGE_ROLES')) return;
	if (role.position > member.guild.me?.roles.highest.position) return;

	return member.roles.add(role);
};
