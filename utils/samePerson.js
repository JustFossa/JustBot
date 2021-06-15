module.exports = {
	name: 'samePerson',
	construct(client) {
		// eslint-disable-next-line func-names
		return function(user, message) {
			const userID = client.users.resolveID(user);
			return message.author.id === userID;
		};
	}
};
