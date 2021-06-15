const Discord = require('discord.js');
require('moment-duration-format');
const moment = require('moment');
const { stripIndents } = require('common-tags');
const { Permissions } = require('discord.js');
module.exports = {
	name: 'server-info',
	description: 'Displays information about the server',
	usage: '',
	example: '',
	category: 'Utility',
	aliases: ['sinfo', 'si'],
	clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.MANAGE_MESSAGES],
	userPermissions: [],
	execute({ message, args }) {
		const embed = new Discord.MessageEmbed();
		const output = embed
			.setColor(global.config.color)
			.setThumbnail(message.guild.iconURL({ format: 'png' }));

		output
			.setColor(global.config.color)
			.setDescription(stripIndents`
         **[TH2 Server](https://discord.gg/dusNMvr7ur)**

        **Owner**
        \`${message.guild.owner.user.tag}\`

       **ID**
        \`${message.guild.id}\`

       **Created On**
        \`${moment.utc(message.guild.createdAt).format('MMMM D, YYYY')}\`
        \`(${moment.duration(new Date() - message.guild.createdAt).format('DD [days]', { trim: 'both mid' })})\`

        **Members**
        \`${message.guild.members.cache.filter(m => !m.user.bot).size}\`

        **Bots**
        \`${message.guild.members.cache.filter(m => m.user.bot).size}\`

        **Roles**
        \`${message.guild.roles.cache.size}\`

        **Emojis**
        \`${message.guild.emojis.cache.size}\`

         **Text Channels**
        \`${message.guild.channels.cache.filter(ch => ch.type === 'text').size}\`
        
        **Voice Channels**
        \`${message.guild.channels.cache.filter(ch => ch.type === 'voice').size}\`
        
        **Region**
        \`${message.guild.region.toUpperCase()}\`
        
        **Verification Level**
        \`${message.guild.verificationLevel}\`
        
        **Server Growth**
        [Click me](https://discord.com/developers/servers/${message.guild.id}/analytics)
        `);

		message.channel.send(embed);
	}
};
