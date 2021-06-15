const { Permissions, MessageEmbed } = require('discord.js');
const { commandUsage } = require('../../models/Usage');
const moment = require('moment');
const paginationEmbed = require('../../utils/paginate');

module.exports = {
	name: 'command-usage',
	description: 'Gives info about the bot',
	usage: '',
	example: '',
	aliases: ['cu'],
	ownerOnly: true,
	category: 'Owner Only',
	clientPermissions: [Permissions.FLAGS.EMBED_LINKS, Permissions.FLAGS.USE_EXTERNAL_EMOJIS],

	async execute({ message, client }) {
		const days = await commandUsage.aggregate([
			{
				'$sort': {
					'timestamp': -1
				}
			}, {
				'$limit': 14
			}, {
				'$project': {
					'COUNT': '$uses',
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

		const months = await commandUsage.aggregate([
			{
				'$sort': {
					'timestamp': -1
				}
			}, {
				'$limit': 365
			}, {
				'$project': {
					'COUNT': '$uses',
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


		const years = await commandUsage.aggregate([
			{
				'$sort': {
					'timestamp': -1
				}
			}, {
				'$project': {
					'COUNT': '$uses',
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
				.setTitle('Day Command Usage')
				.setColor(client.config.color)
				.setDescription(
					days.sort((a, b) => new Date(b._id) - new Date(a._id))
						.map(en => `\`${moment(en._id).format('ddd DD MMM')}:\` \`${en.COUNT.toString().padEnd(2, ' ')}\``)
						.join('\n') || '\u200b'
				),

			new MessageEmbed()
				.setTitle('Month Command Usage')
				.setColor(client.config.color)
				.setDescription(
					months.sort((a, b) => new Date(b._id) - new Date(a._id))
						.map(en => `\`${moment(en._id).format('MMM YYYY')}:\` \`${en.COUNT.toString().padEnd(3, ' ')}\``)
						.join('\n') || '\u200b'
				),

			new MessageEmbed()
				.setTitle('Year Command Usage')
				.setColor(client.config.color)
				.setDescription(
					years.sort((a, b) => new Date(b._id) - new Date(a._id))
						.map(en => `\`${moment(en._id).format('YYYY')}:\` \`${en.COUNT.toString().padEnd(3, ' ')}\``)
						.join('\n') || '\u200b'
				)
		];

		return paginationEmbed(message, pages);
	}
};
