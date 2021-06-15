const { Permissions } = require('discord.js');
const emojis = require('../../commands/emojis/emojis');

const missingPermissions = permissions => {
	const missingPerms = permissions.map(name => {
		if (name === 'VIEW_CHANNEL') return '`READ MESSAGES`';
		if (name === 'MANAGE_GUILD') return '`MANAGE SERVER`';
		return `\`${name.replace(/_/g, ' ')}\``;
	});

	return missingPerms.length > 1
		? `${missingPerms.slice(0, -1).join(', ')} and ${missingPerms.slice(-1)[0]} permissions`
		: `${missingPerms[0]} permission`;
};

module.exports = {
	name: 'set-prefix',
	description: 'Changes the prefix for the current server',
	usage: '<newPrefix>',
	example: '*',
	category: 'Utility',
	aliases: ['prefix', 'setprefix', 'sprefix'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.MANAGE_MESSAGES],

	async execute({ message, args, client, utils: { settings: settingsManager } }) {
		const prefix = args[0];

		const settings = await settingsManager.fetch(message.guild.id);
		if (!prefix) {
			return message.channel.send(
				`My prefix is: \`${settings.prefix || client.config.prefix}\``
			);
		}

		const perms = message.channel.permissionsFor(message.author)
			.missing(
				Permissions.FLAGS.MANAGE_GUILD
			);

		if (perms.length) return message.channel.send(`${emojis.cross} You require the ${missingPermissions(perms)} to use this command!`);
		if (/\s/.test(prefix) || prefix?.length > 3) {
			return message.channel.send('The prefix must be without a space and no more than 3 characters!');
		}

		settings.prefix = prefix;
		await settings.save();
		await settingsManager.setCache(settings);

		await message.channel.send(`Prefix succesfully changed to: ${args[0]}`);
		if (!message.deleted) await message.delete();

		return message.guild.log({
			embeds: [{
				title: 'Prefix Changed',
				color: global.color,
				description: [
					'**Actioned by:**',
					`\`${message.author.tag}\``,
					'',
					'**Prefix**',
					`\`${prefix}\``
				].join('\n')
			}]
		});
	}
};
