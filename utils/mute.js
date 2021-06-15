const Mute = require('../models/mute');

class Muter {
	constructor(client, model) {
		this.client = client;
		this.model = model;
	}

	async setMutes() {
		const mutes = await this.model.find({});
		return Promise.all(mutes.map(async mute => {
			if (!mute.muted) return;
			const guild = this.client.guilds.cache.get(mute.guildID);
			if (!guild) return;
			const member = await guild.members.fetch(mute.userID);
			if (mute.timestamp.getTime() < Date.now()) {
				await this.unMute(member, mute);
			} else {
				this.setTimer(mute, member);
			}
		}));
	}

	async unMute(member, mute) {
		const guild = this.client.guilds.cache.get(mute.guildID);

		if (!guild) return;

		const muteRole = member.roles.cache.find(r => r.name === 'Muted');

		mute.muted = false;
		await member.roles.remove(muteRole);
		await mute.save();
	}

	async getRole(roles) {
		let role = roles.cache.find(r => r.name === 'Muted');
		if (role) return role;

		role = await roles.create({
			data: {
				name: 'Muted',
				hoist: false,
				mentionable: false,
				permissions: 0
			},
			reason: 'No mute role found'
		});
		const guild = role.guild;

		await Promise.all(guild.channels.cache.filter(channel => channel.permissionsFor(guild.me).has('MANAGE_CHANNELS')).map(channel => channel.updateOverwrite(role.id, {
			'SEND_MESSAGES': false
		}, 'Creating Mute role')));
		return role;
	}

	setTimer(mute, member) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				resolve(this.unMute(member, mute));
			}, Math.min(mute.timestamp.getTime() - Date.now(), Math.pow(2, 31) - 1));
		});
	}
}

module.exports = {
	name: 'muter',
	construct(client) {
		const muter = new Muter(client, Mute);
		muter.setMutes();
		return muter;
	},
	Muter
};
