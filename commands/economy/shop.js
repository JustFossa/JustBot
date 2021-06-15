const { Permissions } = require('discord.js');
module.exports = {
	name: 'shop',
	description: 'The economy shop',
	usage: '',
	example: '',
	category: 'Economy',
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [],
	async execute({ message }) {
		return message.channel.send([
			'<**Coming soon!**'
			
		]);
	}
};
