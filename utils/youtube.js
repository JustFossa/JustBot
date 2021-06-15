const Pubsubhubbub = require('pubsubhubbub');
const xml = require('xml2js');

class YoutubeManager {
	constructor(client, token, model, options) {
		this.client = client;
		this.youtubeAPI = require('youtube-api');
		this.youtubeAPI.authenticate({
			type: 'key',
			key: token
		});
		this.Subscription = model;

		this.port = options.port;

		this.pubsubhubbub = Pubsubhubbub.createServer({
			callbackUrl: options.callbackUrl
		});

		this.pubsubhubbub.recieved = [];

		this.pubsubhubbub.on('feed', async data => {
			const { feed } = await xml.parseStringPromise(data.feed.toString());

			if (!feed.entry || !Array.isArray(feed.entry)) return;

			const entry = feed.entry[0];

			const notification = {
				id: entry['yt:videoId'][0],
				channelID: entry['yt:channelId'][0],
				title: entry.title[0],
				link: entry.link[0].$.href,
				channel: { name: entry.author[0].name[0], link: entry.author[0].uri[0] },
				published: new Date(entry.published[0]),
				updated: new Date(entry.updated[0])
			};

			if (this.pubsubhubbub.recieved.includes(notification.id) || notification.updated - notification.published > 300000) return;

			this.pubsubhubbub.recieved.push(notification.id);

			const channels = await this.Subscription.find({ ytChannelID: notification.channelID });

			for (const ytChannel of channels) {
				const channel = this.client.channels.cache.get(ytChannel.channelID);
				if (!channel) continue;
				await channel.send(`**${notification.channel.name}** posted\n\nhttps://youtu.be/${notification.id}`).catch(() => { });
			}
		});
	}

	async init() {
		this.pubsubhubbub.listen(this.port);

		const subscriptions = await this.Subscription.find({});
		Promise.all(subscriptions.map(subscription => this.pubsubhubbub.subscribe(`https://www.youtube.com/xml/feeds/videos.xml?channel_id=${subscription.ytChannelID}`, 'http://pubsubhubbub.appspot.com/')));
	}

	searchChannel(keyword = '') {
		return this.youtubeAPI.search.list({
			part: 'snippet',
			type: 'channel',
			q: keyword,
			maxResults: 1
		}).then(res => res.data.items.length > 0 ? res.data.items[0].snippet : undefined);
	}

	getChannel(id = '') {
		return this.youtubeAPI.channels.list({
			part: 'id, contentOwnerDetails, snippet, status',
			id,
			maxResults: 1
		}).then(res => res.data.items.length > 0 ? res.data.items[0].snippet : undefined);
	}
}

module.exports = {
	name: 'youtube',
	construct(client) {
		const youtube = new YoutubeManager(client, client.config.youtubeToken, require('../models/subscription'), {
			callbackUrl: client.config.youtubeCallbackURL,
			port: client.config.youtubePort || new URL(client.config.youtubeCallbackURL).port
		});
		youtube.init();
		return youtube;
	},
	YoutubeManager
};
