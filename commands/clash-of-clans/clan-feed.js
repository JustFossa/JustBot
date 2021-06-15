/*//eslint-disable no-shadow 
const { Permissions } = require('discord.js');
const { cfSchema } = require('../../models/clanLogger');
const { cocToken } = require('../../config.json');
const { Client } = require('clashofclans.js');

const coc = new Client({
	token: cocToken
});

module.exports = {
	name: 'clan-feed',
	description: 'Setup Clash of Clans feeds with this command',
	usage: '<clanTag>',
	example: '#222CVLVVU',
	category: 'Game',
	clientPermissions: [Permissions.FLAGS.EMBED_LINKS],
	userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
	args: true,
	disabled: true,

	async execute({ args, message, client }) {
		const tag = args[0];
		if (!tag) return message.channel.temp('<:Aeo_cross:809875437470875739> Please provide a tag!');
		const data = await coc.clan(args[0]);

		if (!data.ok) {
			return message.channel.temp('<:Aeo_cross:809875437470875739> Please say a valid Clash of Clans tag!');
		}

		client.config.hold.add(`${message.guild.id}:message_deleted`);
		await message.delete().catch(() => client.config.hold.delete(`${message.guild.id}:message_deleted`));

		await client.utils.clanLogger.add(data.tag);
		const d = await cfSchema.updateOne({ guild: message.guild.id }, {
			$set: {
				guild: message.guild.id,
				channel: message.channel.id,
				tag: data.tag
			}
		}, { upsert: true });

		if (d.upserted) return message.channel.send(`<:Aeo_tick:809875205589565491> Clan feed successfully enabled for **${data.name} - ${data.tag}**`);
		return message.channel.send(`<:Aeo_tick:809875205589565491> Clan feed changed to **${data.name} - ${data.tag}**`);
	}
};*/
