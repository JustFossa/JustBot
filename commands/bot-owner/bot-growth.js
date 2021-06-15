const { Permissions, MessageEmbed } = require('discord.js');
const { botGrowth } = require('../../models/Usage');
const moment = require('moment');
const paginationEmbed = require('../../utils/paginate');

module.exports = {
	name: 'bot-growth',
	description: 'Gives info about the bot',
	usage: '',
	example: '',
	aliases: ['growth'],
	ownerOnly: true,
	category: 'Owner Only',
	clientPermissions: [Permissions.FLAGS.EMBED_LINKS, Permissions.FLAGS.USE_EXTERNAL_EMOJIS],

	async execute({ message, client }) {
		const days = await botGrowth.aggregate([
			{
				'$sort': {
					'timestamp': -1
				}
			}, {
				'$limit': 25
			}, {
				'$project': {
					'COUNT': {
						'$subtract': [
							'$addition', '$deletion'
						]
					},
					'DATE': {
						'$dateToString': {
							'format': '%Y-%m-%d',
							'date': '$timestamp'
						}
					}
				}
			}, {
				'$group': {
					'_id': '$DATE',
					'COUNT': {
						'$sum': '$COUNT'
					}
				}
			}
		]).exec();

		const months = await botGrowth.aggregate([
			{
				'$sort': {
					'timestamp': -1
				}
			}, {
				'$limit': 365
			}, {
				'$project': {
					'COUNT': {
						'$subtract': [
							'$addition', '$deletion'
						]
					},
					'DATE': {
						'$dateToString': {
							'format': '%Y-%m',
							'date': '$timestamp'
						}
					}
				}
			}, {
				'$group': {
					'_id': '$DATE',
					'COUNT': {
						'$sum': '$COUNT'
					}
				}
			}
		]).exec();


		const years = await botGrowth.aggregate([
			{
				'$sort': {
					'timestamp': -1
				}
			}, {
				'$project': {
					'COUNT': {
						'$subtract': [
							'$addition', '$deletion'
						]
					},
					'DATE': {
						'$dateToString': {
							'format': '%Y',
							'date': '$timestamp'
						}
					}
				}
			}, {
				'$group': {
					'_id': '$DATE',
					'COUNT': {
						'$sum': '$COUNT'
					}
				}
			}
		]).exec();

		const pages = [
			new MessageEmbed()
				.setTitle('TH2 Day Growth')
				.setColor(client.config.color)
				.setDescription([
					`\`Total Servers: ${client.guilds.cache.size}\``,
					'',
					days.sort((a, b) => new Date(b._id) - new Date(a._id))
						.map(en => `\`${moment(en._id).format('ddd DD MMM')}:\` \`${en.COUNT.toString().padEnd(2, ' ')}\``)
						.join('\n') || '\u200b'
				]),

			new MessageEmbed()
				.setTitle('TH2 Month Growth')
				.setColor(client.config.color)
				.setDescription([
					`\`Total Servers: ${client.guilds.cache.size}\``,
					'',
					months.sort((a, b) => new Date(b._id) - new Date(a._id))
						.map(en => `\`${moment(en._id).format('MMM YYYY')}:\` \`${en.COUNT.toString().padEnd(3, ' ')}\``)
						.join('\n') || '\u200b'
				]),

			new MessageEmbed()
				.setTitle('TH2 Year Growth')
				.setColor(client.config.color)
				.setDescription([
					`\`Total Servers: ${client.guilds.cache.size}\``,
					'',
					years.sort((a, b) => new Date(b._id) - new Date(a._id))
						.map(en => `\`${moment(en._id).format('YYYY')}:\` \`${en.COUNT.toString().padEnd(3, ' ')}\``)
						.join('\n') || '\u200b'
				])
		];

		return paginationEmbed(message, pages);
	}
};
