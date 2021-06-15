const mongoose = require('mongoose');

const welcomeSchema = new mongoose.Schema(
	{
		join: {
			active: {
				type: Boolean
			},
			channel: {
				type: String
			},
			text: {
				type: String
			},
			type: {
				type: String
			},
			autorole: {
				type: String
			},
			DM: {
				type: Boolean
			},
			DMtext: {
				type: String
			}
		},
		leave: {
			active: {
				type: Boolean
			},
			channel: {
				type: String
			},
			text: {
				type: String
			},
			type: {
				type: String
			}
		},
		inviter: {
			active: {
				type: Boolean
			},
			channel: {
				type: String
			}
		}
	}
);

module.exports = welcomeSchema;
