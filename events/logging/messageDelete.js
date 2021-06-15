module.exports = async (client, message) => {
	if (message.partial) return;
	if (message.channel.type !== 'text') return;

	// Real Magic
	message.edit = (content, options) => message.channel.send(content, options);
	message.delete = () => new Promise(res => res(0));

	if (!message.content) return;
	if (message.author.bot) return;
	if (client.config.hold.delete(`${message.guild.id}:message_deleted`)) return;

	const ms = Date.now() - message.createdAt?.getTime();
	if (ms <= 4000) return;

	const mentions = message.mentions.members.concat(message.mentions.roles)
		.filter(m => (m.user && !m.user.bot) || (!m.user && !m.managed));
	if (mentions.size > 0) {
		return message.guild.log({
			embeds: [{
				title: '**Ghost ping:**\n',
				description: `${'**Actioned by:**\n' +
					`${message.member}\n\n` +
					'**Mention:**\n'}${mentions.map(m => m.toString())}`,
				color: client.config.color
			}]
		}).catch(() => null);
	}

	return message.guild.log({
		embeds: [
			{
				title: '**Message Deleted**',
				description: [
					'**Actioned by:**',
					`\`${message.author.tag}\``,
					'',
					'**Channel:**',
					message.channel,
					'',
					'**Message:**',
					`\`${message.content}\``
				].join('\n'),
				color: client.config.color
			}
		]
	});
};
