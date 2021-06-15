const Discord = require('discord.js');
const fetch = require('node-fetch');
const { stripIndents } = require('common-tags');
const { Permissions } = require('discord.js');
const emojis = require('../emojis/emojis');

module.exports = {
	name: 'weather-info',
	description: 'Displays information about the weather for the provided city',
	usage: '<cityName>',
	example: 'london',
	category: 'Utility',
	aliases: ['temperature', 'humdity', 'weather'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [],
	async execute({ message, client }) {
		const msg = await message.channel.send(client.embed('Which city would you like weather info on?'));
		const awaited = await message.channel.awaitMessages(
			msg => msg.author.id === message.author.id,
			{ max: 1, time: 60000, errors: ['time'] }
		).catch(() => null);

		if (!awaited) {
			return msg.edit(`${emojis.cross} The command timed-out, please type the command to try again!`, { embed: null });
		}

		const m = awaited?.first();
		await m.delete();
		if (m?.content?.toLowerCase() === 'stop') {
			return msg.edit(`${emojis.tick} Command successfully terminated!`, { embed: null });
		}

		const city = m.content;
		const data = await this.getWeather(city);
		if (!data) return msg.edit({ embed: { description: 'City not found!', color: global.config.color } });
		const {
			id,
			name,
			sys: { country },
			coord: { lat, lon },
			weather,
			main: {
				humidity, temp
			},
			wind: { speed }
		} = data;

		const embed = new Discord.MessageEmbed()
			.setColor(global.config.color)
			.setDescription(stripIndents`
			**[TH2 Server](https://discord.gg/dusNMvr7ur)**
			
			**Location**
			[${name}, ${country}](https://openweathermap.org/city/${id})

			Temperature:
			\`${temp} °C\`

			Lat/Lon:
			\`${lat}/${lon}\`

			Condition:
			\`${weather[0].main}\`

			Humidity:
			\`${humidity} %\`

			Wind Speed:
			\`${speed} m/s\`

		
			`);
		return msg.edit({ embed });
	},
	async getWeather(city) {
		const data = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=a8945f8773db2842dc51d27f8f6beb6e&units=metric`)
			.then(res => res.json()).catch(() => null);
		if (!data) return null;
		if (data.cod === '404') return null;
		data.sys.sunrise = this.getFormattedTime(data.sys.sunrise);
		data.sys.sunset = this.getFormattedTime(data.sys.sunset);
		return data;
	},

	getFormattedTime(time) {
		return `${new Date(time * 1000).toTimeString().split(' ')[0]} UTC`;
	}
};
