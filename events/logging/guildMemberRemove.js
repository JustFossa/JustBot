const img = require('../../helpers/w-attachment');
const Discord = require('discord.js');

function convertText(text, member) {
	text = text.replace(/{user}/, `${member.user.tag}`);
	text = text.replace(/{server}/, `${member.guild.name}`);
	text = text.replace(/{count}/, `#${member.guild.memberCount}`);
	return text;
}

function checkOk(settings, active, channel) {
	if (!settings) return false;
	else if (!settings.welcome || !settings.welcome.leave) return false;
	else if (active === false || !active || active === null) return false;
	else if (channel === null || !channel) return false;
	return true;
}

async function send(type, text, channel, member) {
	if (type === 'image') {
		const image = await img.leaveimage(member);
		const attachment = new Discord.MessageAttachment(image, 'leave.png');
		return channel.send(text, attachment);
	}

	switch (type) {
		case 'text':
			return channel.send(text);
		case 'embed':
			text = text.length > 2048 ? text.slice(0, 2048) : text;
			return channel.send({
				embed: {
					color: global.config.color,
					title: 'Member Left!',
					description: text,
					timestamp: new Date(),
					thumbnail: {
						url: member.user.displayAvatarURL()
					}
				}
			});
	}

	return channel.send(text);
}

module.exports = async (client, member) => {
	const settingsManager = client.utils.settings;
	let text;
	const settings = await settingsManager.fetch(member.guild.id);

	if (!settings?.welcome) return;
	const active = settings.welcome.leave.active;
	const channel = member.guild.channels.cache.get(settings.welcome.leave.channel);

	if (checkOk(settings, active, channel) === false) return;

	text = settings.welcome.leave.text;
	if (!text || text === null) text = 'Goodbye {user}!';
	text = convertText(text, member);

	const type = settings.welcome.leave.type;

	if (!member.guild.me?.permissionsIn(channel.id).has(['SEND_MESSAGES', 'EMBED_LINKS'])) return;
	await send(type, text, channel, member);
};
