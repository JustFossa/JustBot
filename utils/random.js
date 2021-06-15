const RandomOrg = require('random-org');

module.exports = {
	name: 'random',
	construct(client) {
		return new RandomOrg({ apiKey: client.config.randomorg });
	}
};
