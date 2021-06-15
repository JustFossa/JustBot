/* eslint-disable eqeqeq */
class BlacklistManager {
	constructor(model) {
		this.model = model;
	}

	get(guildID) {
		return this.model.findOne({ guildID });
	}

	async active(guildID) {
		const doc = await this.get(guildID);

		if (doc) return doc.active;
		return false;
	}

	async toggleActive(guildID, active) {
		let doc = await this.get(guildID);

		if (doc) {
			doc.active = active != undefined ? active : !doc.active;
		} else {
			doc = new this.model({
				guildID,
				active: active != undefined ? active : true
			});
		}

		return doc.save();
	}

	getAll() {
		return this.model.find({});
	}
}

module.exports = {
	name: 'guildBlacklists',
	construct(client) {
		return new BlacklistManager(require('../models/guildBlacklist'));
	}
};
