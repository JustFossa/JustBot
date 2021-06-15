const { MessageEmbed } = require('discord.js');

module.exports = async (client, invite) => {
	const embed = new MessageEmbed()
		.setColor(client.config.color)
		.setTitle('Invite Create')
		.setDescription([
			'**Actioned by:**',
			`\`${invite.inviter?.tag ?? 'Unknown'}\``,
			'',
			'**Invite:**',
			`https://discord.gg/${invite.code}`,
			'',
			'**Channel:**',
			invite.channel
		]);

	return invite.guild.log({ embeds: [embed] });
};
