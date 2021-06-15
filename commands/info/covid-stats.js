const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const paginate = require('../../utils/paginate');
const { stripIndents } = require('common-tags');
const { Permissions } = require('discord.js');
module.exports = {
	name: 'covid-info',
	description: 'Displays information about the latest Covid stats',
	usage: '',
	example: '',
	category: 'Utility',
	aliases: ['covid', 'covid-stats'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.ADD_REACTIONS, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [],
	async execute({ message }) {
		const data = await fetch('https://disease.sh/v3/covid-19/countries').then(res => res.json());
		const countries = data.sort((a, b) => b.cases - a.cases);

		const set1 = countries.slice(0, 15);
		const set2 = countries.slice(15, 30);
		const set3 = countries.slice(30, 45);
		const set4 = countries.slice(45, 60);

		let index = 0;

		const embed = new MessageEmbed()
			.setColor(global.config.color)
			.setTitle('Covid Statistics')
			.setThumbnail('https://cdn.discordapp.com/attachments/677633151933349898/767032113139941417/1602945101279.png')
			.setDescription(stripIndents`
                \`\`\`
                ${set1.map(m => `${++index} ${m.country.padEnd(25, ' ')} ${m.cases}`).join('\n')}
                \`\`\`
            `);

		const embed2 = new MessageEmbed()
			.setColor(global.config.color)
			.setTitle('Covid Statistics')
			.setThumbnail('https://cdn.discordapp.com/attachments/677633151933349898/767032113139941417/1602945101279.png')
			.setDescription(stripIndents`
                \`\`\`
                ${set2.map(m => `${++index} ${m.country.padEnd(25, ' ')} ${m.cases}`).join('\n')}
                \`\`\`
            `);

		const embed3 = new MessageEmbed()
			.setColor(global.config.color)
			.setTitle('Covid Statistics')
			.setThumbnail('https://cdn.discordapp.com/attachments/677633151933349898/767032113139941417/1602945101279.png')
			.setDescription(stripIndents`
                \`\`\`
                ${set3.map(m => `${++index} ${m.country.padEnd(25, ' ')} ${m.cases}`).join('\n')}
                \`\`\`
            `);
		const embed4 = new MessageEmbed()
			.setColor(global.config.color)
			.setTitle('Covid Statistics')
			.setThumbnail('https://cdn.discordapp.com/attachments/677633151933349898/767032113139941417/1602945101279.png')
			.setDescription(stripIndents`
                \`\`\`s
                ${set4.map(m => `${++index} ${m.country.padEnd(25, ' ')} ${m.cases}`).join('\n')}
                \`\`\`
            `);

		paginate(message, [
			embed, embed2, embed3, embed4
		]);
	}
};
