/* eslint-disable no-unused-vars */
const { dlSchema, cfSchema } = require('../models/clanLogger');
const { MessageEmbed } = require('discord.js');
const Client = require('clashofclans-events');
const NUMBERS = require('../commands/emojis/numbers');
const { cocToken, username, password } = require('../config.json');
const fetch = require('node-fetch');

const EVENT_TYPES = {
	'descriptionChange': data => `<:list:717436253402038274> Clan description updated to:\n\n\`\`\`\`\n${data.current}\`\`\``,
	'locationChange': data => `<:Search:717437070821425273> Clan location updated to **${data.current.name ? data.current.name : 'None'}**`,
	'requiredTrophiesChange': data => `<:trophy:721751718701957130> Required trophies changed to **${data.current}**`,
	'clanLevelChange': data => `<:owner:717436253871538327> **${data.name}** leveled up to level **${data.current}**`,
	'typeChange': data => `<:list:717436253402038274> Clan type updated to **${data.current}**`,
	'warFrequencyChange': data => `<:sheild:723943491742334976> War frequently changed to **${data.current}**`,
	'isWarLogPublicChange': data => `<:sheild:723943491742334976> War log chnaged to **${data.current ? 'Public' : 'Private'}**`,
	'warLeagueChange': data => `<:owner:717436253871538327> **${data.name}** was promoted to **${data.current.name}**`,
	'badgeUrlsChange': () => null
};

const RANKS = {
	'member': 'Member',
	'admin': 'Elder',
	'coLeader': 'Co-Leader',
	'leader': 'Leader'
};

const COLOR = global.config.color;
const Coc = new Client({
	ratelimit: 10,
	tokens: [cocToken],
	sync: 122
}, {
	playerJoin: true,
	playerLeft: true,
	donationEvent: true,
	clanEvent: true,
	playerPromote: true,
	playerDemote: true
});

class ClanLogger {
	constructor(client) {
		this.client = client;
		this.tags = [];

		Coc.on('donationEvent', async data => {
			const guilds = await dlSchema.find({ tag: data.tag });
			for (const guild of guilds) {
				const channel = this.channel(guild.channel);
				if (!channel) continue;
				const embed = new MessageEmbed()
					.setColor(COLOR)
					.setDescription([
						`**Donation Log - ${data.name}**`,
						'',
						...data.donated.map(m => `${m.troops > 70 ? m.troops : NUMBERS[m.troops]} **${m.name}**`),
						...data.received.map(m => `${m.troops > 70 ? m.troops : NUMBERS[m.troops]} **${m.name}**`)
					]);
				await channel.send({ embed });
			}
		});

		Coc.on('clanEvent', async data => {
			const guilds = await cfSchema.find({ tag: data.tag });
			const msg = EVENT_TYPES[data.eventType](data);
			if (!msg) return;
			for (const guild of guilds) {
				const channel = this.channel(guild.channel);
				if (!channel) continue;
				const embed = new MessageEmbed()
					.setColor(COLOR)
					.setDescription([
						`**${data.name} - ${data.tag}**`,
						'',
						msg
					]);
				await channel.send({ embed });
			}
		});

		Coc.on('playerJoin', async data => {
			const guilds = await cfSchema.find({ tag: data.clan.tag });
			for (const guild of guilds) {
				const channel = this.channel(guild.channel);
				if (!channel) continue;
				const embed = new MessageEmbed()
					.setColor(COLOR)
					.setDescription([
						`**${data.clan.name} - ${data.clan.tag}**`,
						'',
						`New member joined: **${data.name}**`
					]);
				await channel.send({ embed });
			}
		});

		Coc.on('playerLeft', async data => {
			const guilds = await cfSchema.find({ tag: data.clan.tag });
			for (const guild of guilds) {
				const channel = this.channel(guild.channel);
				if (!channel) continue;
				const embed = new MessageEmbed()
					.setColor(COLOR)
					.setDescription([
						`**${data.clan.name} - ${data.clan.tag}**`,
						'',
						`A member left: **${data.name}**`
					]);
				await channel.send({ embed });
			}
		});

		Coc.on('playerPromote', async data => {
			const guilds = await cfSchema.find({ tag: data.clan.tag });
			for (const guild of guilds) {
				const channel = this.channel(guild.channel);
				if (!channel) continue;
				const embed = new MessageEmbed()
					.setColor(COLOR)
					.setDescription([
						`**${data.clan.name} - ${data.clan.tag}**`,
						'',
						`<${data.name} was demoted to **${RANKS[data.current]}**`
					]);
				await channel.send({ embed });
			}
		});

		Coc.on('playerDemote', async data => {
			const guilds = await cfSchema.find({ tag: data.clan.tag });
			for (const guild of guilds) {
				const channel = this.channel(guild.channel);
				if (!channel) continue;
				const embed = new MessageEmbed()
					.setColor(COLOR)
					.setDescription([
						`**${data.clan.name} - ${data.clan.tag}**`,
						'',
						`${data.name} was promoted to **${RANKS[data.current]}**`
					]);
				await channel.send({ embed });
			}
		});

		Coc.on('error', () => {
			// console.error(error);
		});
	}

	channel(channelId) {
		const permissions = [
			'SEND_MESSAGES',
			'EMBED_LINKS',
			'USE_EXTERNAL_EMOJIS',
			'VIEW_CHANNEL'
		];
		if (this.client.channels.cache.has(channelId)) {
			const channel = this.client.channels.cache.get(channelId);
			if (channel.permissionsFor(channel.guild.me).has(permissions, false)) return channel;
		}
		return undefined;
	}

	async add(tag) {
		// return Coc.add(tag);
	}

	async init() {
		this.login();
		setInterval(this.login.bind(this), 30 * 60 * 1000);

		/*
		this.tags = [...await dlSchema.find(), ...await cfSchema.find()];
		const tags = new Set(this.tags.map(tag => tag.tag));
		return Coc.init(Array.from(tags.values()));
		*/
	}

	async login() {
		const res = await fetch('https://cocdiscordlink.azurewebsites.net/api/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				username,
				password
			})
		}).catch(() => null);

		if (!res) return null;
		if (!res.ok) return null;
		const data = await res.json();
		process.env.LINK_API_TOKEN = data.token;
	}

	async link(userId, tag) {
		const res = await fetch('https://cocdiscordlink.azurewebsites.net/api/links', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${process.env.LINK_API_TOKEN}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				playerTag: tag,
				discordId: userId
			})
		}).catch(() => null);

		if (!res) return null;
		if (res.status !== 200) return null;
		return res;
	}

	async fetch(userId) {
		const res = await fetch(`https://cocdiscordlink.azurewebsites.net/api/links/${userId}`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${process.env.LINK_API_TOKEN}`,
				'Content-Type': 'application/json'
			}
		}).catch(() => null);

		if (!res) return [];
		if (res.status !== 200) return [];
		const arr = await res.json();
		return arr.map(d => d.playerTag).slice(0, 3) || [];
	}
}

module.exports = {
	name: 'clanLogger',
	construct(client) {
		return new ClanLogger(client);
	}
};
