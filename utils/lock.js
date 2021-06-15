class LockManager {
	constructor(client, model) {
		this.model = model;
		this.client = client;

		this.timers = {};
	}

	lock(channel) {
		return channel.updateOverwrite(channel.client.user.id, {
			'SEND_MESSAGES': true
		}, 'Channel locked')
			.then(() => channel.updateOverwrite(channel.guild.id, {
				'SEND_MESSAGES': false
			}, 'Channel locked'));
	}

	unlock(channel) {
		return channel.updateOverwrite(channel.guild.id, {
			'SEND_MESSAGES': true
		}, 'Channel locked');
	}

	unlockMessage(channel, author) {
		channel.guild.log({
			embeds: [{
				title: '**Channel Unlocked**',
				description: `**Actioned by:**\n\`\`\`${author.tag}\`\`\`\n**Channel:**\n${channel}`,
				color: this.client.config.color
			}]
		});

		channel.temp('<:Aeo_tick:809875205589565491> Channel successfully unlocked');
	}

	addTimer(channel, time) {
		if (typeof this.timers[channel.id] != 'undefined') this.client.clearTimeout(this.timers[channel.id]);
		this.timers[channel.id] = this.client.setTimeout(() => {
			this.unlock(channel);

			this.unlockMessage(channel, this.client.user);

			this.model.findOneAndDelete({ channelID: channel.id });
		}, time);
	}
}

module.exports = {
	name: 'locks',
	construct(client) {
		return new LockManager(client, require('../models/lock'));
	}
};
