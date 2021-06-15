class BlacklistManager {
	constructor(model) {
		this.model = model;
	}

	get(userID) {
		return this.model.findOne({ userID });
	}

	async active(userID) {
		const doc = await this.get(userID);

		if (doc) return doc.active;
		return false;
	}

	async toggleActive(userID, active) {
		let doc = await this.get(userID);

		if (doc) {
			doc.active = active !== undefined ? active : !doc.active;
		} else {
			doc = new this.model({
				userID,
				active: active !== undefined ? active : true
			});
		}

		return doc.save();
	}

	getAll() {
		return this.model.find({});
	}
}

module.exports = {
	name: 'userBlacklists',
	construct(client) {
		return new BlacklistManager(require('../models/blacklist'));
	}
};
