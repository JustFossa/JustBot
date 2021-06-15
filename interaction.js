const fetch = require('node-fetch');
const { token } = require('./config.json');
const { ApplicationCommandOptionType } = require('discord-api-types/v8');

const commands = [
	{
		name: 'prefix',
		description: 'Changes the prefix for the current server',
		options: [
			{
				name: 'prefix',
				description: 'The new prefix',
				type: ApplicationCommandOptionType.STRING,
				required: true
			}
		]
	},
	{
		name: 'youtubefeeds',
		description: 'Sets up automated Youtube feeds in the current channel',
		options: [
			{
				name: 'youtube-channel',
				description: 'The YouTube channel',
				type: ApplicationCommandOptionType.STRING,
				required: true
			}
		]
	},
	{
		name: 'seteconomy',
		description: 'Set the economy channel',
		options: [
			{
				name: 'channel',
				description: 'The channel',
				type: ApplicationCommandOptionType.CHANNEL,
				required: true
			}
		]
	},
	{
		name: 'setlogs',
		description: 'Set the mod log channel',
		options: [
			{
				name: 'channel',
				description: 'The channel',
				type: ApplicationCommandOptionType.CHANNEL,
				required: true
			}
		]
	},
	{
		name: 'invite',
		description: 'Invite the bot'
	},
	{
		name: 'emojiadd',
		description: 'Add any emojis to your server!',
		options: [
			{
				name: 'emoji',
				description: 'The emoji',
				type: ApplicationCommandOptionType.STRING,
				required: true
			}
		]
	}
];


// eslint-disable-next-line no-extra-parens
(async () => {
	const res = await fetch('https://discord.com/api/v8/applications/663001347372875817/guilds/685219613146873876/commands', {
		method: 'PUT',
		headers: {
			'Authorization': `Bot ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(commands)
	});
	const body = await res.json();
	console.log(res.status, body);
});

// eslint-disable-next-line no-extra-parens
(async () => {
	const res = await fetch('https://discord.com/api/v8/applications/658732840783052823/commands', {
		method: 'PUT',
		headers: {
			'Authorization': `Bot ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(commands)
	});
	const body = await res.json();
	console.log(res.status, body);
})();
