/*
module.exports = async client => {
	const allSettings = await client.utils.settings.getAll();

	console.log(allSettings);

	await Promise.allSettled(allSettings.map(settings => Promise.allSettled(settings.reactionRoles.map(reactionRole => {
		const channel = client.channels.cache.get(reactionRole.channelID);
		if (!channel) return 0;

		return channel.messages.fetch(reactionRole.messageID)
			.catch(async err => {
				if (err.httpStatus === 404) return;
				throw err;
			});
	}))));
};
*/
