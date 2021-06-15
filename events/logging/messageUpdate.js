const { MessageEmbed, Util } = require('discord.js');

module.exports = async (client, oldMessage, newMessage) => {
	if (oldMessage.partial || newMessage.partial) return;
	if (oldMessage.author.bot || newMessage.author.bot) return;
	if (Util.escapeMarkdown(oldMessage.content) === Util.escapeMarkdown(newMessage.content)) return;

	const embed = new MessageEmbed()
		.setColor(client.config.color)
		.setTitle('Message Updated')
		.setDescription([
			'**Actioned by:**',
			`\`${newMessage.author.tag}\``,
			'',
			'**Channel:**',
			newMessage.channel,
			'',
			'**Old Message:**',
			`\`${oldMessage.content.substring(0, 900)}\``,
			'',
			'**New Message:**',
			`\`${newMessage.content.substring(0, 900)}\``,
			'',
			'**Message URL:**',
			`[Jump To](${newMessage.url})`
		]);
	return newMessage.guild?.log({ embeds: [embed] });
};

