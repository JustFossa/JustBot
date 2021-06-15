const paginationEmbed = async (message, pages) => {
	let page = 0;
	const emojiList = ['⬅', '➡'];
	const msg = await message.channel.send(pages[page].setFooter(`Page ${page + 1} / ${pages.length}`));

	for (const emoji of ['⬅', '➡']) {
		await msg.react(emoji);
	}

	const collector = msg.createReactionCollector(
		(reaction, user) => emojiList.includes(reaction.emoji.name) && user.id === message.author.id,
		{ time: 45000, max: 10 }
	);

	collector.on('collect', reaction => {
		reaction.users.remove(message.author);
		switch (reaction.emoji.name) {
			case emojiList[0]:
				page = page > 0 ? --page : pages.length - 1;
				break;
			case emojiList[1]:
				page = page + 1 < pages.length ? ++page : 0;
				break;
			default:
				break;
		}
		msg.edit(pages[page].setFooter(`Page ${page + 1} / ${pages.length}`));
	});

	collector.on('end', async () => {
		await msg.reactions.removeAll().catch(() => null);
	});

	return msg;
};

module.exports = paginationEmbed;
