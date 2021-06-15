const isUpdating = {};
const idMatcher = /([0-9]{15,21})/;
const { Permissions } = require('discord.js');
function stop(question) {
	delete isUpdating[question.guild.id];
	try {
		return question.edit({
			embed: {
				color: global.config.color,
				description: 'Welcome procedure finished!'
			}
		}).then(m => m.delete({ timeout: 10000 }));
	} catch (e) {
		console.log(e);
	}
}

module.exports = {
	name: 'welcome-setup',
	description: 'SETUP COMMAND ezpz',
	usage: '',
	example: '',
	category: 'Welcome',
	aliases: ['setup-welcome', 'setup-leave', 'leave-setup', 'leave', 'welcome'],
	clientPermissions: [Permissions.FLAGS.ADMINISTRATOR],
	userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
	async execute({ config, message, args, utils: { settings: settingsManager } }) {
		if (args[0] === 'status') {
			require('./welcome-status').execute({ config, message, args, utils: { settings: settingsManager } });
			return;
		}

		config.hold.add(`${message.guild.id}:message_deleted`);
		await message.delete().catch(() => config.hold.delete(`${message.guild.id}:message_deleted`));

		let settings;
		try {
			settings = await settingsManager.fetch(message.guild.id);
		} catch (e) {
			console.log(e);
		}

		let status;

		let exit = false;
		let first = true;
		let embed;
		let question;
		let answer;

		let defaultChannel;
		if (message.guild.systemChannelID) {
			defaultChannel = message.guild.systemChannelID;
		} else {
			defaultChannel = null;
		}

		// default welcome
		if (!settings.welcome) {
			settings.welcome = {
				join: {
					active: false,
					channel: defaultChannel,
					text: 'Welcome to {server}, {user}!',
					type: 'text',
					autorole: null,
					DM: false,
					DMtext: 'Welcome to {server}, {user}!'
				},
				leave: {
					active: false,
					channel: defaultChannel,
					text: 'Goodbye {user}',
					type: 'text'
				},
				inviter: {
					active: false,
					channel: defaultChannel
				}
			};
			await settings.save();
			settingsManager.setCache(settings);
		}

		if (isUpdating[message.guild.id] === true) {
			if (args[0] === 'stop') {
				if (isUpdating[message.guild.id] === true) {
					delete isUpdating[message.guild.id];
					try {
						return message.channel.send({
							embed: {
								color: global.config.color,
								description: 'Welcome procedure finished'
							}
						}).then(m => m.delete({ timeout: 10000 }));
					} catch (e) {
						console.log(e);
					}
				}
			}


			return message.channel.send('The welcome editor is already open!').then(m => {
				m.delete({ timeout: 5000 });
			});
		}
		isUpdating[message.guild.id] = true;

		async function doStop() {
			delete isUpdating[question.guild.id];
			question.delete({ timeout: 1000 });
			message.channel.send(' Time\'s up! Please run the command again!').then(m => m.delete({ timeout: 10000 }));
		}

		while (!exit) {
			embed = {
				color: global.config.color,
				title: 'Welcome module setup',
				description:
					'Please type a number to proceed:',
				fields: [
					{
						name: '\u200b',
						value: '**Channels**:\n' +
							'`1` Set welcome channel\n' +
							'`2` Set the leave channel',
						inline: true
					},
					{
						name: '\u200b',
						value: '**Set messages**:\n' +
							'`3` Set welcome message \n' +
							'`4` Set leave message'
					},
					{
						name: '\u200b',
						value: '**Other**:\n' +
							'`5` Auto-Roles\n' +
							'`6` DM message\n' +
							'`7` Join type\n' +
							'`8` Leave type',
						inline: true
					},
					{
						name: '\u200b',
						value: '**Invite Tracker:**\n`9` Inviter\n' +
							'`10` Inviter channel\n\n',
						inline: true
					},
					{
						name: '\u200b',
						value: '**Note**:\n' +
							'• `Stop` - cancel\n• `Default` - default\n• `Disable` - disable\n',
						inline: true
					}
				]
			};

			if (first === true) {
				first = false;
				question = await message.channel.send({ embed });
			} else {
				await question.edit({ embed });
			}

			try {
				answer = await message.channel.awaitMessages(m => m.author.id === message.author.id && ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'disable', 'stop', 'restart', 'default'].includes(m.content.toLowerCase()), {
					max: 1,
					time: 120000,
					errors: ['time']
				});
				answer.first().delete({ timeout: 0 });
			} catch (e) {
				await doStop();
				return;
			}

			if (answer.first().content.toLowerCase() === 'restart') {
				continue;
			} else if (answer.first().content.toLowerCase() === 'stop') {
				return stop(question);
			} else if (answer.first().content.toLowerCase() === 'default') {
				settings.welcome = {
					join: {
						active: true,
						channel: defaultChannel,
						text: 'Welcome to {server}, {user}!',
						type: 'text',
						autorole: null,
						DM: false
					},
					leave: {
						active: true,
						channel: defaultChannel,
						text: 'Goodbye {user}',
						type: 'text'
					},
					inviter: {
						active: false,
						channel: defaultChannel
					}
				};
				await settings.save();
				settingsManager.setCache(settings);
				delete isUpdating[question.guild.id];
				return question.edit({ embed: status });
			} else if (answer.first().content.toLowerCase() === 'disable') {
				if (settings.welcome.join.active === true) {
					settings.welcome.join.active = false;
				}

				if (settings.welcome.leave.active === true) {
					settings.welcome.leave.active = false;
				}

				await settings.save();
				settingsManager.setCache(settings);

				await question.delete({ timeout: 1000 });
				await message.channel.send('Welcome module disabled').then(m => m.delete({
					timeout: 10000
				}));
				return stop(question);
			} else if (answer.first().content === '1') {
				question = await question.edit({
					embed: {
						color: global.config.color,
						title: 'Channel setup:\n',
						description: 'Please mention the channel you want your join messages to go:'
					}

				});

				try {
					answer = await message.channel.awaitMessages(m => m.author.id === message.author.id && (m.mentions.channels.first() || ['restart', 'stop'].includes(m.content.toLowerCase())), {
						max: 1,
						time: 120000,
						errors: ['time']
					});
					answer.first().delete({ timeout: 0 });
				} catch (e) {
					await doStop();
					return;
				}

				if (answer.first().mentions.channels.first()) {
					settings.welcome.join.channel = answer.first().mentions.channels.first().id;
				} else if (answer.first().content.toLowerCase() === 'stop') {
					return stop(question);
				} else if (answer.first().content.toLowerCase() === 'restart') {
					continue;
				} else {
					return message.channel.send('Error found, please start again!').then(m => m.delete({ timeout: 20000 }));
				}
			} else if (answer.first().content === '2') {
				question = await question.edit({
					embed: {
						color: global.config.color,
						title: 'Channel setup:\n',
						description: 'Please mention the channel you want your leave messages to go:'
					}

				});

				try {
					answer = await message.channel.awaitMessages(m => m.author.id === message.author.id && (m.mentions.channels.first() || ['restart', 'stop'].includes(m.content.toLowerCase())), {
						max: 1,
						time: 120000,
						errors: ['time']
					});
					answer.first().delete({ timeout: 0 });
				} catch (e) {
					await doStop();
					return;
				}

				if (answer.first().mentions.channels.first()) {
					settings.welcome.leave.channel = answer.first().mentions.channels.first().id;
				} else if (answer.first().content.toLowerCase() === 'stop') {
					return stop(question);
				} else if (answer.first().content.toLowerCase() === 'restart') {
					continue;
				} else {
					return message.channel.send('Error found, please start again!').then(m => m.delete({ timeout: 20000 }));
				}
			} else if (answer.first().content === '3') {
				question = await question.edit({
					embed: {
						color: global.config.color,
						title: 'Set messages:\n',
						description: 'What would you like your welcome message to be?\n\nNote:\n• `Disable` to disable welcome messages\n• `{user}` to mention the person\n• `{server}` for your server name\n• `{count}` for total members count'
					}
				});

				try {
					answer = await message.channel.awaitMessages(m => m.author.id === message.author.id, {
						max: 1,
						time: 180000,
						errors: ['time']
					});
					answer.first().delete({ timeout: 0 });
				} catch (e) {
					await doStop();
					return;
				}

				if (answer.first().content.toLowerCase() === 'stop') {
					return stop(question);
				} else if (answer.first().content.toLowerCase() === 'restart') {
					continue;
				} else if (answer.first().content.toLowerCase() === 'disable') {
					if (settings.welcome.join.active === true) {
						settings.welcome.join.active = false;
					}
				} else {
					if (settings.welcome.join.active === false) {
						settings.welcome.join.active = true;
					}
					settings.welcome.join.text = answer.first().content;
				}
			} else if (answer.first().content === '4') {
				question = await question.edit({
					embed: {
						color: global.config.color,
						title: 'Set messages:\n',
						description: 'What would you like your leave message to be?\n\nNote:\n• `Disable` to disable leave messages\n• `{user}` to mention the user\n• `{server}` for your server name\n• `{count}` for total members count'
					}
				});

				try {
					answer = await message.channel.awaitMessages(m => m.author.id === message.author.id, {
						max: 1,
						time: 180000,
						errors: ['time']
					});
					answer.first().delete({ timeout: 0 });
				} catch (e) {
					await doStop();
					return;
				}

				if (answer.first().content.toLowerCase() === 'stop') {
					return stop(question);
				} else if (answer.first().content.toLowerCase() === 'restart') {
					continue;
				} else if (answer.first().content.toLowerCase() === 'disable') {
					if (settings.welcome.leave.active === true) {
						settings.welcome.leave.active = false;
					}
				} else {
					if (settings.welcome.leave.active === false) {
						settings.welcome.leave.active = true;
					}
					settings.welcome.leave.text = answer.first().content;
				}
			} else if (answer.first().content === '5') {
				let role;
				question = await question.edit({
					embed: {
						color: global.config.color,
						title: ' Other:\n',
						description: 'Please mention the autorole for welcome:\n\nNote: \n• `disable` to disable auto-roles'
					}
				});

				try {
					answer = await message.channel.awaitMessages(m => m.author.id === message.author.id && (m.mentions.roles.first() || ['disable', 'restart', 'stop'].includes(m.content.toLowerCase()) ||
						message.guild.roles.cache.find(r => r.name === m.content)), {
						max: 1,
						time: 120000,
						errors: ['time']
					});
					answer.first().delete({ timeout: 0 });
				} catch (e) {
					await doStop();
					return;
				}

				if (!answer) return;
				const idMatch = idMatcher.exec(answer.first().content.toLowerCase());
				if (!answer.first().mentions.roles.first()) {
					role = answer.first().guild.roles.cache.find(r => r.name === answer.first().content) ||
						answer.first().guild.roles.cache.find(r => r.id === answer.first().content);
				} else if (idMatch) {
					role = answer.first().guild.roles.cache.find(r => r.id === answer.first().mentions.roles.first().id);
				}

				if (role) {
					settings.welcome.join.autorole = role.id;
				} else if (answer.first().content.toLowerCase() === 'disable') {
					settings.welcome.join.autorole = null;
				} else if (answer.first().content.toLowerCase() === 'stop') {
					return stop(question);
				} else if (answer.first().content.toLowerCase() === 'restart') {
					continue;
				}
			} else if (answer.first().content === '6') {
				question = await question.edit({
					embed: {
						color: global.config.color,
						title: 'Other:\n',
						description: 'What would you like the DM message to be?\n\nNote:\n• `disable` to disable DM messages\n• `{user}` to mention the user\n• `{server}` for your server name'
					}
				});

				try {
					answer = await message.channel.awaitMessages(m => m.author.id === message.author.id, {
						max: 1,
						time: 180000,
						errors: ['time']
					});
					answer.first().delete({ timeout: 0 });
				} catch (e) {
					await doStop();
					return;
				}

				if (answer.first().content.toLowerCase() === 'disable') {
					settings.welcome.join.DM = false;
				} else if (answer.first().content.toLowerCase() === 'stop') {
					return stop(question);
				} else if (answer.first().content.toLowerCase() === 'restart') {
					continue;
				} else {
					settings.welcome.join.DM = true;
					settings.welcome.join.DMtext = answer.first().content;
				}
			} else if (answer.first().content === '7') {
				question = await question.edit({
					embed: {
						color: global.config.color,
						title: 'Other:\n',
						description: 'Choose between image, embed or text for your welcome message...'
					}
				});

				try {
					answer = await message.channel.awaitMessages(m => m.author.id === message.author.id || ['image', 'embed', 'text', 'restart', 'stop'].includes(m.content.toLowerCase()), {
						max: 1,
						time: 150000,
						errors: ['time']
					});
					answer.first().delete({ timeout: 0 });
				} catch (e) {
					await doStop();
					return;
				}

				if (answer.first().content.toLowerCase() === 'image') {
					settings.welcome.join.type = 'image';
				} else if (answer.first().content.toLowerCase() === 'embed') {
					settings.welcome.join.type = 'embed';
				} else if (answer.first().content.toLowerCase() === 'text') {
					settings.welcome.join.type = 'text';
				} else if (answer.first().content.toLowerCase() === 'stop') {
					return stop(question);
				} else if (answer.first().content.toLowerCase() === 'restart') {
					continue;
				}
			} else if (answer.first().content === '8') {
				question = await question.edit({
					embed: {
						color: global.config.color,
						title: 'Other:\n',
						description: 'Choose between image, embed or text for your leave message...'
					}
				});

				try {
					answer = await message.channel.awaitMessages(m => m.author.id === message.author.id || ['image', 'embed', 'text', 'restart', 'stop'].includes(m.content.toLowerCase()), {
						max: 1,
						time: 150000,
						errors: ['time']
					});
					answer.first().delete({ timeout: 0 });
				} catch (e) {
					await doStop();
					return;
				}

				if (!answer) return;
				if (answer) answer.first().delete({ timeout: 0 });
				if (answer.first().content.toLowerCase() === 'image') {
					settings.welcome.leave.type = 'image';
				} else if (answer.first().content.toLowerCase() === 'embed') {
					settings.welcome.leave.type = 'embed';
				} else if (answer.first().content.toLowerCase() === 'text') {
					settings.welcome.leave.type = 'text';
				} else if (answer.first().content.toLowerCase() === 'stop') {
					return stop(question);
				} else if (answer.first().content.toLowerCase() === 'restart') {
					continue;
				}
			} else if (answer.first().content.toLowerCase() === '9') {
				question = await question.edit({
					embed: {
						color: global.config.color,
						title: 'Other:\n',
						description: 'Would you like to enable or disable the invite tracker?'
					}
				});

				try {
					answer = await message.channel.awaitMessages(m => m.author.id === message.author.id || ['enable', 'disable', 'restart', 'stop'].includes(m.content.toLowerCase()), {
						max: 1,
						time: 150000,
						errors: ['time']
					});
					answer.first().delete({ timeout: 0 });
				} catch (e) {
					await doStop();
					return;
				}

				if (answer.first().content.toLowerCase() === 'disable') {
					settings.welcome.inviter.active = false;
				} else if (answer.first().content.toLowerCase() === 'enable') {
					settings.welcome.inviter.active = true;
				} else if (answer.first().content.toLowerCase() === 'stop') {
					return stop(question);
				} else if (answer.first().content.toLowerCase() === 'restart') {
					continue;
				}
			} else if (answer.first().content.toLowerCase() === '10') {
				question = await question.edit({
					embed: {
						color: global.config.color,
						title: 'Channel setup:\n',
						description: 'Please mention the channel you would like the inviter messages to go:'
					}
				});

				try {
					answer = await message.channel.awaitMessages(m => m.author.id === message.author.id && (m.mentions.channels.first() || ['restart', 'stop'].includes(m.content.toLowerCase())), {
						max: 1,
						time: 120000,
						errors: ['time']
					});
					answer.first().delete({ timeout: 0 });
				} catch (e) {
					await doStop();
					return;
				}

				if (answer.first().mentions.channels.first()) {
					settings.welcome.inviter.channel = answer.first().mentions.channels.first().id;
					// await message.channel.send("Leave channel is now: <#" + answer.first().mentions.channels.first() + ">")
				} else if (answer.first().content.toLowerCase() === 'stop') {
					return stop(question);
				} else if (answer.first().content.toLowerCase() === 'restart') {
					continue;
				} else {
					return message.channel.send('Error found, please start again!').then(m => m.delete({ timeout: 10000 }));
				}
			} else {
				return stop(question);
			}

			question = await question.edit({
				embed: {
					color: global.config.color,
					title: 'Welcome Module Setup',
					description:
						'Setting succesfully saved!\n\n' +
						'Type:\n' +
						'• `Continue` - continue with the process\n' +
						'• `Stop` - to cancel\n' +
						'• `Restart` - re-do the process\n'

				}
			});

			await settings.save();
			settingsManager.setCache(settings);


			try {
				answer = await message.channel.awaitMessages(m => m.author.id === message.author.id && ['continue', 'restart', 'stop'].includes(m.content.toLowerCase()), {
					max: 1,
					time: 120000,
					errors: ['time']
				});
				answer.first().delete({ timeout: 0 });
			} catch (e) {
				await doStop();
				return;
			}

			if (answer.first().content.toLowerCase() === 'continue' || answer.first().content.toLowerCase() === 'restart') {
				continue;
			}
			if (answer.first().content.toLowerCase() === 'stop') return stop(question);
			await question.edit({
				embed: {
					color: global.config.color,
					description: 'Welcome successfully completed!'
				}
			});
			delete isUpdating[question.guild.id];
			exit = true;
		}
	}
};
