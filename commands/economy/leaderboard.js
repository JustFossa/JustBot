const economyUser = require('../../models/economy');
const Discord = require('discord.js');
const { Permissions } = require('discord.js');
function chunks(items = []) {
	const chunk = 20;
	const array = [];
	for (let i = 0; i < items.length; i += chunk) {
		array.push(items.slice(i, i + chunk));
	}
	return array;
}

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

module.exports = {
	name: 'leaderboard',
	description: 'Displays the Global Economy Leaderboard across 5 pages, check to see where you rank!',
	usage: '',
	example: '',
	aliases: ['lb'],
	category: 'Economy',
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.ADD_REACTIONS],
	userPermissions: [],
	async execute({ client, message, settings, prefix }) {
		if (!settings.economyChannelID) return message.channel.send(`You must setup an economy channel in order to use this command!\n\n\`\`\`${prefix}seteconomy <mentionChannel>\`\`\``, { embed: null });
		if (settings.economyChannelID && message.channel.id !== settings.economyChannelID) return message.channel.send(`You may only use this command in <#${settings.economyChannelID}>`);

		const users = await economyUser.find().sort({ balance: -1 }).limit(100);
		users.forEach(async u => {
			await client.users.fetch(u.userID).catch(() => null);
		});
		const economyUsers = users.map(user => ({ id: user.userID, balance: user.balance }));
		economyUsers.sort((a, b) => b.balance - a.balance);

		const pages = chunks(economyUsers.filter(u => client.users.cache.has(u.id))).map((chunk, i) => {
			const embed = new Discord.MessageEmbed()
				.setColor(global.config.color)
				.setThumbnail(message.guild.iconURL({ dynamic: true, format: 'png' }))
				.setDescription([
					'**Global Economy Leaderboard**',
					'',
					...chunk
						.map((user, j) => {
							let messageToSend;

							switch ((i * 10) + (j + 1)) {
								case 1:
									messageToSend = `:first_place:. **\`${client.users.cache.get(user.id).tag}\`** - **\`${user.balance}\`**`;
									break;
								case 2:
									messageToSend = `:second_place:. **\`${client.users.cache.get(user.id).tag}\`** - **\`${user.balance}\`**`;
									break;
								case 3:
									messageToSend = `:third_place:. **\`${client.users.cache.get(user.id).tag}\`** - **\`${user.balance}\`**`;
									break;
								default:
									messageToSend = `${(i * 10) + (j + 1)}. **\`${client.users.cache.get(user.id).tag}\`** - **\`${user.balance}\`**`;
									break;
							}

							return messageToSend;
						})
				]);
			return embed;
		});

		return paginationEmbed(message, pages);
	}
};
