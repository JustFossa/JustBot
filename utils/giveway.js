class GivewayManager {
	constructor(client, model) {
		this.client = client;
		this.model = model;
	}

	add(channelID, messageID, winners, time) {
		const doc = new this.model({
			channelID,
			messageID,
			winners,
			time
		});
		return doc.save()
			.then(res => {
				this.setTimeout(res);
				return res;
			});
	}

	setTimeout(doc) {
		this.client.setTimeout(async () => {
			if (doc.complete) return;
			doc.complete = true;
			await doc.save();
			await this.displayWinners(doc);
		}, doc.time.getTime() - Date.now());
	}

	getChannel(doc) {
		const channel = this.client.channels.cache.get(doc.channelID);
		return channel;
	}

	async getMessage(channel, doc) {
		try {
			return await channel.messages.fetch(doc.messageID);
		} catch (err) {
		}
	}

	async getReacted(message) {
		const messageReactions = message.reactions.cache.get('🎫');
		if (!messageReactions) return;

		if (messageReactions.count !== messageReactions.users.cache.size) {
			let users;
			while (!users || users.size === 100) {
				users = await messageReactions.users.fetch({
					after: users ? users.last().id : undefined
				});
			}
		}

		return messageReactions.users.cache.filter(u => !u.bot);
	}

	async chooseWinners(amount, message, prevUsers) {
		const users = (await this.getReacted(message))?.filter(u => !prevUsers?.includes(u.id));

		if (!users || users.size < 1 || amount < 1) return [];

		let winners;

		if (users.size === 1) {
			winners = [0];
		} else {
			winners = await this.generateWinners(amount, users.size - 1);
			// const randomResult = await this.client.utils.random.generateIntegers({ n: doc.winners, min: 0, max: users.size - 1, replacement: false});
		}

		return winners.map(i => users.array()[i]);
	}

	async showWinners(channel, winners) {
		channel.send(`🎉 Congratulations you just won the giveaway ${winners.join(', ')}`);
	}

	async displayWinners(doc) {
		const channel = this.getChannel(doc);
		if (!channel) return doc.remove();

		const message = await this.getMessage(channel, doc);
		if (!message) return doc.remove();

		const winners = await this.chooseWinners(doc.winners, message, doc.users);

		if (winners.length < 1) {
			return channel.send('**No winner for this giveaway!**');
		}

		doc.users = [...new Set([...doc.users ?? [], ...winners.map(u => u.id)])];
		await doc.save();
		return this.showWinners(channel, winners);
	}

	generateWinners(amount, max) {
		return this.client.utils.random.generateIntegers({ n: amount, min: 0, max, replacement: false })
			.then(data => data.random.data);
	}
}

module.exports = {
	name: 'giveway',
	construct(client) {
		return new GivewayManager(client, require('../models/giveway'));
	}
};
