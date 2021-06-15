const { readdirSync } = require('fs');
const { join } = require('path');
const eventsPath = join(__dirname, '../events');

module.exports = client => {
	client.config.eventGroups.forEach(dir => {
		const eventGroupPath = join(eventsPath, dir);
		readdirSync(eventGroupPath).filter(d => d.endsWith('.js'))
			.forEach(file => {
				const event = require(join(eventGroupPath, file));
				if (typeof event != 'function') return;
				const eventName = file.split('.')[0];
				client.on(eventName, event.bind(null, client));
			});
	});
};
