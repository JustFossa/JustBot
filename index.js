const chalk = require('chalk');
const Discord = require('discord.js');

// Adding date to logs
(() => {
	process.on('uncaughtException', err => {
		console.error(err);
		process.exit(1); 
	});
	function intercept(stream, color) {
		const write = stream.write;
		
		stream.write = function() {
			
			const args = [...arguments];
			if (typeof args[0] == 'string') {
				args[0] = `${color(`[${new Date().toUTCString()}]`)} ${args[0]}`;
			}
			return write.apply(stream, args);
		};
	}
	intercept(process.stdout, chalk.green);
	intercept(process.stderr, chalk.red);
})();

// modules
global.Discord = Discord;
global.mongoose = require('mongoose');
const Ajv = require('ajv');
const ajv = new Ajv();
let configJSON = {};

try {
	configJSON = require('./config.json');
} catch (err) {
	return console.error(err);
}

const config = Object.assign({}, {
	prefix: '!',
	collections: ['commands', 'aliases'],
	handlers: ['event', 'login', 'database', 'utils', 'prototypes', 'command'],
	commandGroups: [
		'bot-owner', 'clash-of-clans', 'custom-commands', 'economy', 'modmail', 'giveaway',
		'emojis', 'info', 'invites', 'moderation', 'roles', 'search', 'suggestions',
		'utility', 'welcome', 'clash-royale', 'brawl-stars', 'youtube', 'ticket', 'help', 'support-server'
	],
	eventGroups: [
		'command', 'logging', 'prefix', 'invites', 'kick', 'ticket', 'modmail',
		'reactionRoles', 'locks', 'giveaway', 'guildBlacklist', 'autoBalance', 'role'
	],
	utils: ['settings', 'log', 'automod', 'temp', 'mute', 'invites', 'samePerson',
		'userBlacklist', 'guildBlacklist', 'lock', 'giveway', 'random', 'getResponse',
		'table', 'wrap', 'channelBlock', 'remindScheduler', 'clanLogger', 'youtube', 'categoryBlock'],
	owners: { 'Koni': '578678204890349594'},
	color: 9677018,
	blacklists: true,
	hold: new Set(),
	logging: true
}, configJSON);

global.config = config;



const validateConfig = ajv.compile({
	token: { type: String, default: 'test' },
	collections: { type: Array, items: String },
	handlers: { type: Array, items: String },
	commandGroups: { type: Array, items: String },
	eventGroups: { type: Array, items: String },
	utils: { type: Array, items: String },
	required: ['token']
});

const configValid = validateConfig(config);

if (!configValid) return console.error('Config invalid:', ajv.errorsText(validateConfig.errors));


global.color = config.color;


const client = new Discord.Client({
	messageCacheMaxSize: 100,
	messageCacheLifetime: 300,
	messageSweepInterval: 300,
	ws: { intents: Discord.Intents.ALL },
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
	presence: { activity: { name: '!invite || !help', type: 'PLAYING' }, status: 'online' }
});


client.config = config;

client.isOwner = id => Object.values(config.owners).includes(id);

client.embed = msg => ({
	embed: {
		description: msg,
		color: config.color
	}
});


config.collections.forEach(collection => client[collection] = new Discord.Collection());


(async () => {
	const handlers = config.handlers;
	for (let i = 0; i < handlers.length; i++) {
		const handler = handlers[i];
		try {
			await require(`./handlers/${handler}`)(client);
		} catch (err) {
			console.error(err);
			console.error(`${chalk.bgYellow('Failed')} loading handler ${chalk.bold(handler)}`);
		}
	}
})();

const messageEvent = require('./events/command/message');
client.ws.on('INTERACTION_CREATE', async res => {
	const message = Object.assign({}, res);
	if (!res.member?.user?.id) return;
	try {
		message.guild = client.guilds.cache.get(message.guild_id);
		message.channel = client.channels.cache.get(res.channel_id);
		if (client.users.cache.has(message.member.user.id)) {
			message.author = client.users.cache.get(message.member.user.id);
		} else {
			message.author = await this.client.users.fetch(message.member.user.id);
		}
		if (message.guild.members.cache.has(message.member.user.id)) {
			message.member = message.guild.members.cache.get(message.member.user.id);
		} else {
			message.member = await message.guild.members.fetch(message.member.user.id);
		}

		message.delete = () => new Promise(res => res(0));
	} catch {
		return;
	}

	await client.api.interactions(res.id, res.token).callback.post({ data: { type: 5 } });
	await client.api.webhooks(client.user.id, res.token).messages['@original'].delete();
	message.content = `${client.user} ${message.data.name} ${message.data.options[0].value}`;
	if (!message.channel.permissionsFor(client.user).has(['SEND_MESSAGES', 'VIEW_CHANNEL'])) return;
	return messageEvent(client, message, false);
});
