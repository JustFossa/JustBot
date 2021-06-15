module.exports = async client => {
	await client.utils.settings.getAll();

	/* for (let i = 0; i < allSettings.length; i++) {
		const settings = allSettings[i];
		if (!settings.ticketSystem.enabled) continue;
		try {
			const channel = await client.channels.cache.get(settings.ticketSystem.channelID);
			if (!channel) continue;
			const message = await channel.messages.fetch(settings.ticketSystem.messageID);
			const category = await client.channels.cache.get(settings.ticketSystem.categoryID);
			if (!category) continue;
			const children = category.children.filter(c => c.type === 'text').array();
			for (let i = 0; i < children.length; i++) {
				const child = children[i];
				try {
					await child.messages.fetch({ after: child.id, limit: 1 });
				} catch (err) {}
			}
		} catch (err) {}
	}*/
};

