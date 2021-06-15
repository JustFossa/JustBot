/* eslint-disable eqeqeq */
class ChannelBlock {
	constructor(model) {
		this.model = model;
	}

	get(channelID) {
		return this.model.findOne({ channelID });
	}

	async active(channelID) {
		const doc = await this.get(channelID);

		if (doc) return doc.active;
		return false;
	}

	async toggleActive(channelID, active) {
		let doc = await this.get(channelID);

		if (doc) {
			doc.active = active != undefined ? active : !doc.active;
		} else {
			doc = new this.model({
				channelID,
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
	name: 'channelBlock',
	construct(client) {
		return new ChannelBlock(require('../models/channelBlock'));
	}
};
