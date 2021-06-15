const { MessageEmbed } = require('discord.js');
const { cocToken } = require('../../config.json');
const { Client } = require('clashofclans.js');
const { stripIndents } = require('common-tags');
const { Permissions } = require('discord.js');
const coc = new Client({
    token: cocToken, baseURL: 'https://coc.clashperk.com/v1'
});
const { labels } = require('../emojis/coc-labels');
const paginationEmbed = require('../../utils/paginate');

module.exports = {
    name: 'sign',
    description: 'sign up command for users',
    usage: '<playerTag>',
    example: '#ertetr',
    category: 'Game',
    aliases: ['signup'],
    clientPermissions: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
    userPermissions: [],
    cached: new Map(),
    async execute({ message, args, client }) {

        let tags = args[0] ? [args[0]] : [];

        if (!tags.length) {
            tags = await client.utils.clanLogger.fetch(message.author.id);
        }

        if (!tags.length) return message.channel.send('Please provide a tag!');

        const pages = [];
        for (const tag of tags) {
            const data = await coc.player(tag).catch(err => {
                console.log(err);
                return { ok: false, status: err.code, name: err.message };
            });
            if (data.status === 503) {
                return message.channel.send('**Clash of Clans** API is down!');
            }
            if (!data.ok && data.status === 404) {
                return message.channel.send('Please provide a valid tag!');
            }

            if (!data.ok && data.status !== 404) {
                return message.channel.send(`${data.reason}`);
            }

                const embed = new MessageEmbed()
                .setColor(global.config.color)
                .setTitle(`${data.name} - ${data.tag}`)
                .setThumbnail('https://cdn.discordapp.com/attachments/717460150528639077/751713217096712213/unnamed.png')
                .setDescription(stripIndents`
                **[TH2](https://discord.gg/dusNMvr7ur)**
                [Player Link Here](https://link.clashofclans.com/en?action=OpenPlayerProfile&tag=${encodeURIComponent(data.tag)})

                Actioned by:,
				${message.author.tag},
                
                Name:
                \`${data.name}\`

                XP:
                \`${data.expLevel}\`

                Home Village:
                \`${data.trophies}\`

                War Stars:
                \`${data.warStars}\`

                
              `);

              const channel = client.channels.cache.get('836627602578997259');
              channel.send(embed);
    
        }
    }
}