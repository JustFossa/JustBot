module.exports = async (client, message) => {
	message.mentions.roles.each(role => {
		message.guild.log({
			embeds: [{
				title: '**Role Mentioned**',
				description: `**Role:**\n${role}\n\n**Actioned by:**\n\`${message.author.tag}\`\n\n**Channel:**\n${message.channel}`,
				color: client.config.color
			}]
		}).catch(() => null);
	});
};
