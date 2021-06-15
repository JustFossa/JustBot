/* eslint-disable eqeqeq */
class CategoryBlock {
	constructor(model) {
		this.model = model;
	}

	get(categoryID) {
		return this.model.findOne({ categoryID });
	}

	async active(categoryID) {
		const doc = await this.get(categoryID);

		if (doc) return doc.active;
		return false;
	}

	async toggleActive(categoryID, active) {
		let doc = await this.get(categoryID);

		if (doc) {
			doc.active = active != undefined ? active : !doc.active;
		} else {
			doc = new this.model({
				categoryID,
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
	name: 'categoryBlock',
	construct(client) {
		return new CategoryBlock(require('../models/categoryBlock'));
	}
};
