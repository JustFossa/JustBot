const Thread = require('../../models/thread');

module.exports = async (client, channel, user) => {
	if (user.bot) return;
	if (channel.type === 'dm') {
		const recipientThread = await Thread.findOne({ recipient: user.id, closed: false });
		if (!recipientThread) return;

		const channel = client.channels.cache.get(recipientThread.channel);
		channel?.startTyping();
		setTimeout(() => {
			channel?.stopTyping(true);
		}, 5000);
	} else if (channel.type === 'text') {
		const recipientThread = await Thread.findOne({ channel: channel.id, closed: false });
		if (!recipientThread?.dmChannel) return;

		const dm = client.channels.cache.get(recipientThread.dmChannel);
		dm?.startTyping();
		setTimeout(() => {
			dm?.stopTyping(true);
		}, 5000);
	}
};
