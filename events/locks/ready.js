const Lock = require('../../models/lock');

module.exports = async client => {
	const locks = await Lock.find({});
	locks.forEach(lock => {
		const channel = client.channels.cache.get(lock.channelID);
		if (!channel) return;
		if (lock.time.getTime() <= Date.now()) {
			lock.remove();
			client.utils.locks.unlock(channel);
			client.utils.locks.unlockMessage(channel, client.user);
		} else {
			client.utils.locks.addTimer(channel, Math.min(Math.pow(2, 31) - 1, lock.time.getTime() - Date.now()));
		}
	});
};
