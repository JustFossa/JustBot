const { MessageEmbed } = require('discord.js');

module.exports = async (client, oldState, newState) => {
	if ((oldState && oldState.member && oldState.member.user.bot) || (newState.member && newState.member.user.bot)) return;

	if (!newState.member) return;
	const embed = new MessageEmbed()
		.setColor(client.config.color);

	if ((!oldState || (oldState && !oldState.channel)) && newState.channel) {
		embed.setTitle('Joined Voice Channel');
		embed.setDescription([
			'**Actioned by:**',
			`\`${newState.member.user.tag}\``,
			'',
			'**Channel:**',
			newState.channel
		]);
	} else if (oldState && oldState.channel && newState.channel) {
		embed.setTitle('Voice channel changed');
		embed.setDescription([
			'**Actioned by:**',
			`\`${newState.member.user.tag}\``,
			'',
			'**From:**',
			oldState.channel,
			'',
			'**To:**',
			newState.channel
		]);
	} else if (oldState && oldState.channel && !newState.channel) {
		embed.setTitle('Left Voice Channel');
		embed.setDescription([
			'**Actioned by:**',
			`\`${newState.member.user.tag}\``,
			'',
			'**Channel:**',
			oldState.channel
		]);
	}

	if (embed.length) return newState.guild.log({ embeds: [embed] });
};
