const { MessageEmbed } = require('discord.js');
const { cocToken } = require('../../config.json');
const { Client } = require('clashofclans.js');
const { troops } = require('../emojis/troops.js');
const { spells } = require('../emojis/spells.js');
const { sieges } = require('../emojis/sieges.js');
const { heroes } = require('../emojis/heros.js');
const pets = require('../emojis/pets.js');
const paginate = require('../../utils/paginate');
const { Permissions } = require('discord.js');
const coc = new Client({
	token: cocToken
});

// Make sure to import your emoji!!

module.exports = {
	name: 'coc-troops',
	description: 'Provides your troop levels for Clash of Clans',
	usage: '<playertag>',
	example: '#YO8LLQCJO',
	category: 'Game',
	aliases: ['t', 'troops'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.ADD_REACTIONS],
	userPermissions: [],
	async execute({ message, args }) {
		const tag = args[0];
		if (!tag) return message.channel.send('Please provide a tag!');
		const data = await coc.player(tag).catch(err => {
			console.log(err);
			return { ok: false, status: err.code, name: err.message };
		});

		if (data.status === 503) {
			return message.channel.send('**Clash of Clans** API is down!');
		}
		if (!data.ok) {
			return message.channel.send(` ${data.reason}`);
		}

		let troopLevels = '';
		let count = 0;


		const embed1 = new MessageEmbed()
			.setColor(global.config.color)
			.setAuthor(`${data.name}\u200e ${data.tag}`, `https://coc.guide/static/imgs/other/town-hall-${data.townHallLevel}.png`)
			.setThumbnail('https://cdn.discordapp.com/attachments/717460150528639077/751713217096712213/unnamed.png')
			.setFooter('Troop Level / Max Level');
		const embed2 = new MessageEmbed()
			.setColor(global.config.color)
			.setAuthor(`${data.name}\u200e ${data.tag}`, `https://coc.guide/static/imgs/other/town-hall-${data.townHallLevel}.png`)
			.setThumbnail(`https://coc.guide/static/imgs/other/town-hall-${data.townHallLevel}.png`)
			.setFooter('Troop Level / Max Level');

		for (const troop of data.troops.filter(a => !['Wall Wrecker', 'Battle Blimp', 'Stone Slammer', 'Siege Barracks', 'Super Barbarian', 'Super Giant', 'Sneaky Goblin', 'Super Wall Breaker', 'Super Witch', 'Super Valkyrie', 'Super Archer', 'Inferno Dragon'].includes(a.name))) {
			if (troop.village === 'home') {
				count++;
				if (!troops[troop.name]) continue;
				troopLevels += `${troops[troop.name]} \`\u200e${troop.level.toString().padStart(2, ' ')}/${troop.maxLevel.toString().padEnd(2, ' ')}\u200e\`\u2000`;
				if (count > 0 && count % 4 === 0) {
					troopLevels += '\n';
				} else {
					troopLevels += ' ';
				}
			}
		}

		if (troopLevels) {
			embed1.setDescription(['**Troop Levels**', troopLevels]);
		}

		let machineLevels = '';
		count = 0;
		data.troops.filter(a => ['Wall Wrecker', 'Battle Blimp', 'Stone Slammer', 'Siege Barracks'].includes(a.name)).forEach(troop => {
			if (troop.village === 'home') {
				count++;
				machineLevels += `${sieges[troop.name]} \`\u200e${troop.level.toString().padStart(2, ' ')}/${troop.maxLevel.toString().padEnd(2, ' ')}\u200e\`\u2000`;
				if (count > 0 && count % 4 === 0) {
					machineLevels += '\n';
				} else {
					machineLevels += ' ';
				}
			}
		});
		if (machineLevels) {
			embed2.addField('Siege Machine Levels', `\n${machineLevels.slice(0, machineLevels.length - 2)}`);
		}

		let troopLevels2 = '';
		count = 0;
		data.troops.forEach(troop => {
			if (troop.village === 'builderBase') {
				count++;
				troopLevels2 += `${troops[troop.name]} \`\u200e${troop.level.toString().padStart(2, ' ')}/${troop.maxLevel.toString().padEnd(2, ' ')}\u200e\`\u2000`;
				if (count > 0 && count % 4 === 0) {
					troopLevels2 += '\n';
				} else {
					troopLevels2 += ' ';
				}
			}
		});
		if (troopLevels2) embed1.addField('Builder Troop Levels', troopLevels2);
		// /////////////////////////////

		let spellLevels = '';
		count = 0;
		data.spells.forEach(spell => {
			if (spell.village === 'home') {
				count++;
				spellLevels += `${spells[spell.name]} \`\u200e${spell.level.toString().padStart(2, ' ')}/${spell.maxLevel.toString().padEnd(2, ' ')}\u200e\`\u2000`;
				if (count > 0 && count % 4 === 0) {
					spellLevels += '\n';
				} else {
					spellLevels += ' ';
				}
			}
		});
		if (spellLevels) embed2.addField('Spell Levels', spellLevels.slice(0, spellLevels.length - 2));
		// ////////////////////////////
		let heroLevels = '';
		count = 0;
		data.heroes.forEach(hero => {
			count++;
			heroLevels += `${heroes[hero.name]} \`\u200e${hero.level.toString().padStart(2, ' ')}/${hero.maxLevel.toString().padEnd(2, ' ')}\u200e\`\u2000`;
			if (count > 0 && count % 4 === 0) {
				heroLevels += '\n';
			} else {
				heroLevels += ' ';
			}
		});
		if (heroLevels) embed2.addField('Hero Levels', heroLevels);


		let petLevels = '';
		count = 0;
		data.troops.filter(troop => troop.name in pets).forEach(pet => {
			count++;
			petLevels += `${pets[pet.name]} \`\u200e${pet.level.toString().padStart(2, ' ')}/${pet.maxLevel.toString().padEnd(2, ' ')}\u200e\`\u2000`;
			if (count > 0 && count % 4 === 0) {
				petLevels += '\n';
			} else {
				petLevels += ' ';
			}
		});

		if (petLevels) embed2.addField('Pets', petLevels);

		const pages = [
			embed1,
			embed2
		];

		return paginate(message, pages);
	}
};
