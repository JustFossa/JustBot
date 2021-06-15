const { Permissions } = require('discord.js');

module.exports = {
	name: 'role-updates',
	description: 'Get the update role.',
	usage: '',
	example: '',
	aliases: [],
	category: 'Support Server',
	ownerOnly: false,
	clientPermissions: [Permissions.FLAGS.MANAGE_ROLES],
	async execute({ message }) {
		if (message.guild.id !== '790520947987054612') return;

		const member = message.guild.members.cache.get(message.author.id);
		const role = message.guild.roles.cache.find(r => r.id === '836252420556324914');

		try {
			if (member.roles.cache.find(r => r.id === role.id)) {
				member.roles.remove(role);
				message.channel.send('Removed role successfully.');
			} else {
				member.roles.add(role);
				message.channel.send('Added role successfully.');
			}
		} catch (err) {
			console.log(err);

			message.channel.send('Couldn\'t add role');
		}
	}
};
