const message = require('./message');

module.exports = async (client, oldMessage, newMessage) => {
	if (oldMessage.partial || newMessage.partial) return;
	if (oldMessage.author.bot || newMessage.author.bot) return;

	if (oldMessage.content === newMessage.content) return;
	if (!newMessage.content) return;

	return message(client, newMessage, false);
};
