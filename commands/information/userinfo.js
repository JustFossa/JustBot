const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Client, Intents } = require("discord.js")


module.exports = {
    
 data: new SlashCommandBuilder()
	.setName('userinfo')
	.setDescription('Replies with user info!')
    .addUserOption(option => option.setName("target")
        .setDescription("Shows info about mentioned user ")
        .setRequired(true)),

   async execute(interaction, client) {

    const member = interaction.options.getMember("target")
    
    const roles = []
    
    const flags = {
        DISCORD_EMPLOYEE: 'Discord Employee',
        DISCORD_PARTNER: 'Discord Partner',
        BUGHUNTER_LEVEL_1: 'Bug Hunter (Level 1)',
        BUGHUNTER_LEVEL_2: 'Bug Hunter (Level 2)',
        HYPESQUAD_EVENTS: 'HypeSquad Events',
        HOUSE_BRAVERY: 'House of Bravery',
        HOUSE_BRILLIANCE: 'House of Brilliance',
        HOUSE_BALANCE: 'House of Balance',
        EARLY_SUPPORTER: 'Early Supporter',
        TEAM_USER: 'Team User',
        SYSTEM: 'System',
        VERIFIED_BOT: 'Verified Bot',
        VERIFIED_DEVELOPER: 'Verified Bot Developer'
    };
    const userFlags = member.user.flags.toArray();

    const userinfo = new MessageEmbed()
        .setAuthor(`${member.tag}`, member.user.displayAvatarURL())
        .setTitle("User Info")
        .setDescription(`**Username:** \`${member.user.username}\`\n**Nickname:** \`${member.nickname || "None"}\`\n**ID:** \`${member.user.id}\`\n**Joined at:** <t:${member.joinedTimestamp}:F>\n**Pending:** \`${member.pending}\`\n**Flags:** \`${userFlags.length ? userFlags.map(flag => flags[flag]).join(', ') : 'None'}\```)
        .setColor("AQUA")

            interaction.reply({
                embeds: [userinfo]
            })
        
}
}