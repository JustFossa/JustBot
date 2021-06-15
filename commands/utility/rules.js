const { Permissions } = require('discord.js');
module.exports = {
	name: 'rules',
	description: 'th2 tourney rules command',
	usage: '',
	example: '',
	category: 'Utility',
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [],
	async execute({ message }) {
		return message.channel.send([
			'**Tournament Rules**',
			'https://bit.ly/3eENulI'
		]);
	}
};
