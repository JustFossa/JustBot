const Chart = require('@clashperk/quickchart');

const months = [
	'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
	'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];
const { Permissions, MessageAttachment } = require('discord.js');

const { botGrowth } = require('../../models/Usage');

module.exports = {
	name: 'server-growth',
	description: 'Gives info about the bot',
	usage: '',
	example: '',
	aliases: [],
	ownerOnly: true,
	category: 'Owner Only',
	clientPermissions: [Permissions.FLAGS.EMBED_LINKS, Permissions.FLAGS.USE_EXTERNAL_EMOJIS],

	async execute({ message, args }) {
		const [min, max] = [15, 90];
		const limit = Math.max(Math.min(Number(args[0]) || 15, max), min);
		const collection = await botGrowth.find({ timestamp: { $gte: new Date(Date.now() - ((limit + 1) * 24 * 60 * 60 * 1000)) } })
			.sort({ timestamp: 1 });

		const buffer = await this.graph(collection.slice(-limit).map(growth => ({ date: new Date(growth.timestamp), value: growth })));

		const file = new MessageAttachment(buffer, 'server-growth.png');
		return message.channel.send({ files: [file] });
	},

	graph(collection = []) {
		const total = collection.reduce((pre, curr) => Number(pre) + Number(curr.value.addition - curr.value.deletion), 0);
		const body = {
			backgroundColor: 'white',
			width: 500,
			height: 300,
			devicePixelRatio: 2.0,
			format: 'png',
			chart: {
				type: 'bar',
				data: {
					labels: [...collection.map(d => `${months[d.date.getMonth()]} ${d.date.getDate()}`)],
					datasets: [
						{
							type: 'bar',
							label: 'Addition',
							backgroundColor: '#36a2eb80',
							borderColor: '#36a2eb',
							data: [...collection.map(d => d.value.addition)]
						},
						{
							type: 'bar',
							label: 'Deletion',
							backgroundColor: '#ff638480',
							borderColor: '#ff6384',
							data: [...collection.map(d => Math.abs(d.value.deletion))]
						},
						{
							type: 'line',
							label: 'Growth',
							backgroundColor: '#69c49a',
							borderColor: '#69c49a',
							fill: false,
							data: [...collection.map(d => d.value.addition - d.value.deletion)]
						}
					]
				},
				options: {
					responsive: false,
					legend: {
						position: 'top',
						display: true,
						labels: {
							fontSize: 10,
							padding: 4
						}
					},
					title: {
						display: true,
						fontSize: 10,
						padding: 2,
						text: [`Total ${total} | Server Growth (${collection.length}D)`]
					}
				}
			}
		};

		return Chart.render(body.width, body.height, body.backgroundColor, body.devicePixelRatio, body.chart);
	}
};
