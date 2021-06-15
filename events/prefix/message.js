module.exports = async (client, message) => {
	const matched = new RegExp(`^<@!?(${client.user?.id})>$`, 'i').exec(message.content);
	if (!matched?.length) return;

	const settings = await client.utils.settings.fetch(message.guild.id);
	return message.channel.send(
		`My prefix is: \`${settings.prefix || client.config.prefix}\``,
		{ time: 10000 }
	);
};
