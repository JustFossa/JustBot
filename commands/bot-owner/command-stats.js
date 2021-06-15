const { Permissions, MessageEmbed } = require('discord.js');
const { commandStats } = require('../../models/Usage');
const moment = require('moment');
const paginationEmbed = require('../../utils/paginate');

module.exports = {
	name: 'command-stats',
	description: 'Gives info about the bot',
	usage: '',
	example: '',
	aliases: ['cs'],
	ownerOnly: true,
	category: 'Owner Only',
	clientPermissions: [Permissions.FLAGS.EMBED_LINKS, Permissions.FLAGS.USE_EXTERNAL_EMOJIS],

	async execute({ message, client }) {
		const commands = await commandStats.find().sort({ uses: -1 });

		const categoryObj = commands.reduce((prev, cmd) => {
			const category = client.commands.get(cmd.name)?.category;
			if (category && category !== 'Owner Only') prev[category] = (prev[category] || 0) + cmd.uses;
			return prev;
		}, {});

		const categories = [];
		for (const [key, val] of Object.entries(categoryObj)) {
			categories.push({ name: key, uses: val });
		}
		categories.sort((a, b) => b.uses - a.uses);

		const command_list = commands.filter(cmd => {
			const command = client.commands.get(cmd.name);
			return command && command?.category !== 'Owner Only' && !command?.ownerOnly;
		});

		const pages = [
			new MessageEmbed()
				.setColor(client.config.color)
				.setTitle('Command Stats')
				.setDescription(
					command_list.slice(0, 20)
						.map(en => `\`${en.name.padEnd(15, ' ')}:\` \`${en.uses.toString().padEnd(3, ' ')}\``)
						.join('\n')
				),

			new MessageEmbed()
				.setColor(client.config.color)
				.setTitle('TH2 Command Category Stats')
				.setDescription(
					categories.map(en => `\`${en.name.padEnd(15, ' ')}:\` \`${en.uses.toString().padEnd(3, ' ')}\``).sort((a, b) => b.uses - a.uses).join('\n')
				),

			new MessageEmbed()
				.setColor(client.config.color)
				.setTitle('TH2 unused commands')
				.setDescription(
					command_list.reverse()
						.slice(0, 50)
						.map(en => `\`${en.name.padEnd(15, ' ')}:\` \`${en.uses.toString().padEnd(3, ' ')}\``)
						.join('\n')
				)
		];

		return paginationEmbed(message, pages);
	}
};
