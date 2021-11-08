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
    

    
const roles = member.roles.cache
			.sort((a, b) => b.position - a.position)
			.map(role => role.toString())
			.slice(0, -1);

    const userinfo = new MessageEmbed()
        .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL())
        .setTitle("User Info")
        .setDescription(`**Tag:** \`${member.user.tag}\`\n**Nickname:** \`${member.nickname || "None"}\`\n**ID:** \`${member.user.id}\`\n\n**Joined at:** <t:${parseInt(member.joinedTimestamp / 1000)}:R>\n**Account Created:** <t:${parseInt(member.user.createdAt / 1000)}:R>\n\n**Pending:** \`${member.pending}\`\n**Display Color (HEX):** \`${member.displayHexColor}\`\n**Roles[${roles.length}]:** ${roles.length < 10 ? roles.join(', ') : 'None'}`)
        .setColor("AQUA")

            interaction.reply({
                embeds: [userinfo]
            })
        
}
}