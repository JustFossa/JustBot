const CacheManager = require('../helpers/cache');

const Settings = require('../models/settings');

class SettingsManager extends CacheManager {
	constructor(model, ttl) {
		super(model, ttl);
		this.smile = '😁'; 
	}

	async fetch(id) {
		let settings = this.cache.get(id);

		if (!settings || this.isCacheExpired(settings)) {
			settings = await this.model.findOne({ guildID: id });
			if (!settings) {
				settings = new Settings({
					guildID: id
				});
				await settings.save();
			}
			this.setCache(settings);
		} else {
			this.model.findOne({ guildID: id }).then(newSettings => {
				if (newSettings) {
					const oldSettings = this.cache.get(id);
					if (oldSettings &&
						newSettings.updatedAt instanceof Date &&
						oldSettings.updatedAt instanceof Date &&
						newSettings.updatedAt.getTime() < oldSettings.updatedAt.getTime()) return;
				}

				this.setCache(newSettings);
			});
		}
		return settings;
	}
}

module.exports = {
	name: 'settings',
	construct(client) {
		return new SettingsManager(Settings, 10 * 60 * 1000);
	}
};
