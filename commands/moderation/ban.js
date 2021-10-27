const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans specified user'),
        .addStringOption(option => option.setName('member')
        .setDescription('Member you want to ban')
        .setRequired(true))
        
            
    
    
};