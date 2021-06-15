const paginate = require('../../utils/paginate');
const Discord = require('discord.js');
const { Permissions } = require('discord.js');
module.exports = {
	name: 'welcome-status',
	description: 'View the current status for the welcome module',
	usage: '',
	example: '',
	category: 'Welcome',
	aliases: ['welcomestatus'],
	clientPermissions: [Permissions.FLAGS.ADMINISTRATOR],
	userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
	async execute({ config, message, args, utils: { settings: settingsManager } }) {
		config.hold.add(`${message.guild.id}:message_deleted`);
		await message.delete().catch(() => config.hold.delete(`${message.guild.id}:message_deleted`));

		let settings;
		try {
			settings = await settingsManager.fetch(message.guild.id);
		} catch (e) {
			console.log(e);
		}

		if (!settings.welcome) {
			return message.channel.temp(
				'Please active the welcome module to see the status!'
			);
		}

		let jointext;
		let leavetext;
		let status;
		let DMtext;

		const joinactive = settings.welcome.join.active === true ? '<enabled' : '<disabled';
		const joinchannel = settings.welcome.join.channel ? `<#${settings.welcome.join.channel}>` : '`Not set`';
		jointext = settings.welcome.join.text ? `\`${settings.welcome.join.text}\`` : 'Not set';
		jointext = jointext.length > 1024 ? `\`${jointext.slice(0, 1020)}...\`` : jointext;
		const jointype = settings.welcome.join.type ? `\`${settings.welcome.join.type}\`` : '`Not set`';

		const leaveactive = settings.welcome.leave.active === true ? '<:enabled' : '<disabled';
		const leavechannel = settings.welcome.leave.channel ? `<#${settings.welcome.leave.channel}>` : '`Not set`';
		leavetext = settings.welcome.leave.text ? `\`${settings.welcome.leave.text}\`` : '`Not set`';
		leavetext = leavetext.length > 1024 ? `${leavetext.slice(0, 1020)}...\`` : leavetext;
		const leavetype = settings.welcome.leave.type ? `\`${settings.welcome.leave.type}\`` : '`Not set`';

		const DM = settings.welcome.join.DM === true ? '`Enabled`' : '`Disabled`';
		DMtext = settings.welcome.join.DMtext ? `\`${settings.welcome.join.DMtext}\`` : '`Not set`';
		DMtext = DMtext.length > 1024 ? `${DMtext.slice(0, 1020)}...\`` : DMtext;
		const autorole = settings.welcome.join.autorole !== null ? `<@&${settings.welcome.join.autorole}>` : '`Not set`';

		const inviter_active = settings.welcome.inviter.active === true ? '`Enabled`' : '`Disabled`';
		const inviter_channel = settings.welcome.inviter.channel ? `<#${settings.welcome.inviter.channel}>` : '`Not set`';

		const page1 = new Discord.MessageEmbed()
			.setColor(global.config.color)
			.setTitle('Welcome status')
			.setDescription(`${joinactive} Join\n${leaveactive} Leave \n\n`);

		const page2 = new Discord.MessageEmbed()
			.setColor(global.config.color)
			.setTitle('Join status')
			.setDescription(
				`**Channel:**\n${joinchannel}\n\n` +
				`**Type:**\n${jointype}\n\n` +
				`**Autorole:**\n${autorole}\n\n` +
				`**Message:**\n${jointext}\n\n` +
				`**DM:**\n${DM}\n\n` +
				`**DM Message:**\n${DMtext}\n\n`

			);

		const page3 = new Discord.MessageEmbed()
			.setColor(global.config.color)
			.setTitle('Leave status')
			.setDescription(
				`**Channel:**\n${leavechannel}\n\n` +
				`**Type:**\n${leavetype}\n\n` +
				`**Message:**\n${leavetext}\n\n`
			);


		const page4 = new Discord.MessageEmbed()
			.setColor(global.config.color)
			.setTitle('Invite tracker')
			.setDescription(
				`**Invite:**\n${inviter_active}\n\n` +
				`**Channel:**\n${inviter_channel}\n\n`
			);

		const pages = [page1, page2, page3, page4];

		await paginate(message, pages);
	}
};
