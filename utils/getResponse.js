module.exports = {
	name: 'getResponse',
	construct(client) {
		return async (author, channel, options = {}, filter) => (await channel.awaitMessages(filter || (msg => msg.author.id === author.id), Object.assign({}, {
			max: 1
		}, options))).first();
	}
};
