const ms = require('ms');
const Discord = require('discord.js');
const { Permissions } = require('discord.js');
module.exports = {
	name: 'giveaway',
	description: 'Sets up a giveaway in the current server',
	usage: '',
	example: '',
	category: 'Utility',
	clientPermissions: [Permissions.FLAGS.ADD_REACTIONS, Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
	async execute({
		message,
		utils: {
			giveway,
			getResponse
		},
		client
	}) {
		const {
			channel,
			author,
			guild,
			member
		} = message;

		message.delete().catch(() => null);

		const embed = new Discord.MessageEmbed({
			title: 'What would you like to give away?',
			color: global.color
		});

		const askMessage = await channel.send(embed);

		async function sendStop() {
			await askMessage.delete().catch(() => { });
			await channel.send('Process terminated successfully');
		}
		async function doStop(content) {
			if (content === 'stop') {
				await sendStop();
				return true;
			}
		}

		let title;

		while (!title) {
			let titleMessage;
			try {
				titleMessage = await getResponse(author, channel);
				titleMessage.delete();
			} catch (err) {
				return;
			}

			if (await doStop(titleMessage.content)) return;

			if (titleMessage.content.length < 1) {
				channel.temp('Please provide a valid title', { time: 3000 }).catch(() => { });
				continue;
			}

			title = titleMessage.content;
		}

		embed.setTitle('How many winners will there be?');
		await askMessage.edit(embed);

		let winners;
		let numWinners;

		while (typeof numWinners == 'undefined') {
			let winnersMessage;
			try {
				winnersMessage = await getResponse(author, channel);
				winnersMessage.delete();
			} catch (err) {
				return;
			}

			if (await doStop(winnersMessage.content)) return;

			const numWinnersParsed = Number(winnersMessage.content);
			if (isNaN(numWinnersParsed)) {
				channel.temp('Please provide a valid number of winners', { time: 3000 });
				continue;
			} else if (numWinnersParsed < 1) {
				channel.temp('Please say a number higher than 1', { time: 3000 });
				continue;
			}

			numWinners = numWinnersParsed;
		}

		embed.setTitle('How long will the giveaway last?');
		await askMessage.edit(embed);

		let time;

		while (!time) {
			let timeStrMessage;
			try {
				timeStrMessage = await getResponse(author, channel);
				await timeStrMessage.delete();
			} catch (err) {
				return;
			}

			if (await doStop(timeStrMessage.content)) return;

			time = ms(timeStrMessage.content);
			if (typeof time == 'undefined') {
				channel.temp('Please provide a valid time!', { time: 3000 });
				continue;
			} else if (time < 1) {
				channel.temp('Please say a number higher than 1!', { time: 3000 });
				continue;
			}
		}

		/* embed.setTitle('<:tag:717436253649502250> Would you like to ping a role for this giveaway? If so please mention the role now, otherwise say "no"');
		askMessage.edit(embed);

		let roleStr;

		let roleStrMessage;
		try {
			roleStrMessage = await getResponse(author, channel);
			await roleStrMessage.delete();
			roleStr = roleStrMessage.content;
		} catch (err) {
			return;
		}

		let role;
		if (roleStr) {
			const roleIDMatch = roleStr.match(/\d{17,19}/);
			if (roleIDMatch) {
				const roleID = roleIDMatch[0];
				role = guild.roles.cache.get(roleID);
			}
		}

		if (await doStop(roleStr)) return;*/


		askMessage.delete().catch(() => { });

		const endTime = new Date(Date.now() + time);

		const givewayMessage = await channel.send({
			// content: role,
			embed: new Discord.MessageEmbed({
				title: `Prize: ${title}`,
				description: `Giving away: ${numWinners}\nHosted by: ${author.tag}`,
				footer: {
					text: 'Ends in'
				},
				timestamp: endTime,
				color: client.config.color
			})
		});

		await giveway.add(channel.id, givewayMessage.id, numWinners, endTime);

		await givewayMessage.react('🎫');
	}
};
