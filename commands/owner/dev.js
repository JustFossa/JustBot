const { SlashCommandBuilder } = require('@discordjs/builders');
const {MessageEmbed} = require("discord.js")
const devModel = require("../../models/dev.js")
module.exports = {
 data: new SlashCommandBuilder()
	.setName('dev')
	.setDescription('Puts Bot into dev status')
	.addStringOption(option => option.setName("value").setDescription("status to set dev status to (true / false)")),

   async execute(interaction, client) {


	if(interaction.user.id !== "729224025401851915") {
		interaction.reply({
			content: "You cannot use this command!"
		})
	}
		 const data = devModel.findOne({

           _id: 1
			 
		 })

		 if (interaction.options.getString('value') == "true") {
			 if(!data) {
				const newData1 = new devModel({
					 _id: 1,
					 status: true
				 })
				await newData1.save()
			 } else if (data){
				await devModel.findOneAndUpdate({
					_id: 1,
				
				 }, {status: true})
			
				 
			 }

			 const embedEnabled = new MessageEmbed()
			 		.setTitle(`Development mode`)
					.setDescription(`Status: \`enabled\` \n Enabled by: \`${interaction.user.tag}\`` )
					.setColor("RED")
					.setTimestamp()
				
					await interaction.reply({
						embeds: [embedEnabled]
					})
					
			 
		 }

		 if (interaction.options.getString('value') == "false") {
			 if(!data) {
				const newData1 = new devModel({
					 _id: 1,
					 status: false	 })
				await newData1.save()
		
			 } else if (data){
			await devModel.findOneAndUpdate({
					_id: 1,
					 
				 }, {status: false}
				 )
			
		
					
			 }

			 const embedDisabled = new MessageEmbed() 
			 		.setTitle("Development mode")
					 .setDescription(`Status: \`disabled\` \n Enabled by: \`${interaction.user.tag}\``)
			 			.setColor(`GREEN`)
						 .setTimestamp()

			await interaction.reply({
				embeds: [embedDisabled]
			})
			 
		 }
   
   }
   
   
   
}