/* eslint-disable no-shadow */
const { MessageEmbed, Collection } = require('discord.js');
const { Permissions } = require('discord.js');
// eslint-disable-next-line no-unused-vars
const settingMap = {
	'1': 'swearing',
	'2': 'links',
	'3': 'massMention',
	'4': 'duplicateText',
	'5': 'emojiSpam',
	'6': 'massCaps'
};

const nameMap = {
	'swearing': 'Swearing',
	'links': 'Links',
	'massMention': 'Mass mention',
	'duplicateText': 'Duplicate text',
	'emojiSpam': 'Emoji Spam',
	'massCaps': 'Mass Caps'
};

const usersUsing = new Collection();

function formatNamespace(message) {
	return `${message.guild.id}:${message.author.id}`;
}

module.exports = {
	name: 'auto-moderation',
	description: 'Secure your server with the highest level of security from auto moderation',
	usage: '',
	example: '',
	category: 'Moderation',
	aliases: ['automod'],
	logs: true,
	modBypass: true,
	clientPermissions: [Permissions.FLAGS.ADMINISTRATOR, Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	userPermissions: [Permissions.FLAGS.MANAGE_GUILD],

	async execute({ client, message, settings, utils: { settings: settingsManager }, config, color, args }) {
		client.config.hold.add(`${message.guild.id}:message_deleted`);
		await message.delete().catch(() => client.config.hold.delete(`${message.guild.id}:message_deleted`));

		const { channel, author } = message;
		if (!settings.autoMod) settings.autoMod = {};
		let optionSettings = settings.autoMod;
		if (args[0] === 'status') {
			const embed = new MessageEmbed({
				title: '**Auto-Mod**',
				description: `${Object.keys(nameMap).map(ref => {
					const status = optionSettings[ref];
					return `${status ? 'enabled' : 'disabled'} ${nameMap[ref]}`;
				}).join('\n')}`,
				color
			});
			channel.send(embed);
		} else {
			if (usersUsing.get(formatNamespace(message))) return channel.temp('You already have the auto-mod editor open');
			usersUsing.set(formatNamespace(message), true);
			const embed = new MessageEmbed({
				title: '**Auto-Moderation**',
				description: `Please type a number to proceed...

${Object.values(nameMap).map((name, index) => `\`${index + 1}\` ${name}`).join('\n')}\n\n` +
					'• `Reset` to disable all\n' +
					'• `Cancel` to stop operation',
				color
			});
			const toggleSetting = async setting => {
				const settingValue = !optionSettings[setting];
				optionSettings[setting] = settingValue;
				await settings.save();
				await settingsManager.setCache(settings);
				return channel.temp(`${settingValue ? 'enabled' : 'disabled'} ${nameMap[setting]} successfully ${settingValue ? 'enabled' : 'disabled'}`);
			};
			const infoMessage = await channel.send(embed);
			const filter = message => message.author.id === author.id && !message.content.startsWith(settings.prefix || config.prefix);
			const collector = channel.createMessageCollector(filter, { idle: 120000 });
			collector.on('collect', async message => {
				const chosenSetting = message.content.trim().toLowerCase();
				const setting = Object.keys(nameMap)[chosenSetting - 1];
				message.delete().catch(() => null);
				if (setting) {
					toggleSetting(setting);
				} else if (chosenSetting.toLowerCase() === 'reset') {
					optionSettings = {};
					await settings.save();
					settingsManager.setCache(settings);
					channel.temp('Settings reseted');
				} else if (chosenSetting.toLowerCase() === 'cancel' || chosenSetting.toLowerCase() === 'stop') {
					collector.stop();
				} else {
					channel.temp('Please enter a valid number!');
				}
			});
			collector.on('end', () => {
				usersUsing.delete(formatNamespace(message));
				embed.setTitle('');
				embed.setDescription('Procedure stopped');
				infoMessage.edit(embed).then(m => m.delete({ timeout: 3000 }).catch(() => null));
			});
		}
	}
};

// :security: Auto-Moderation

// 1 Swearing
// 2 Links
// 3 Mass mention
// 4 Duplicate text
// 5 Emoji Spam
// 6 Mass Caps

// Reset to reset to disable all
