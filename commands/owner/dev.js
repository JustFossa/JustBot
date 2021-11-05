const mongoose = require("mongoose")
const { SlashCommandBuilder } = require("@discordjs/builders")
const devSchema = require("../../models/dev")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("dev")
        .setDescription("This is to manage bot's Maintanance status. Only usable by owner")
        .addBooleanOption(option => option.setName("status")
                .setDescription("Status: true/false")
                .setRequired(true)),
        
    async execute(client, interaction) {
      
        
        
        
            let data = devSchema.findOne({
                guildId: interaction.guild.id
            })

            


        if (interaction.options.getBoolean() == "true") {
            if(data) {
                devSchema.findOneAndUpdate({
                    guildId: interaction.guild.id,
                    status: false
                })

            } else if(!data) {
                const newData = new devSchema({
                    guildId: interaction.guild.id,
                    status: false
                })
                await newData.save()
            }
           await interaction.reply({ content:"Dev set to: True"})
}

if (interaction.options.getBoolean() == "false") {
    if(data) {
        devSchema.findOneAndUpdate({
            guildId: interaction.guild.id,
            status: false
        })
        
    } else if(!data) {
        const newData2 = new devSchema({
            guildId: interaction.guild.id,
            status: false
        })
        await newData2.save()
    }
   await  interaction.reply({content: "Dev set to: False"})

}
}
}