const { SlashCommandBuilder } = require('@discordjs/builders');
const {MessageEmbed} = require("discord.js")
const devModel = require("../../models/dev.js")
module.exports = {
 data: new SlashCommandBuilder()
	.setName('dev')
	.setDescription('Puts Bot into dev status')
	.addStringOption(option => option.setName("value").setDescription("status to set dev status to (true / false)")),

   async execute(interaction, client) {

		 const data = devModel.findOne({

           _id: 1
			 
		 })

		 if (interaction.options.getString('value') == "true") {
			 if(!data) {
				const newData1 = new devModel({
					 _id: 1,
					 status: 'true'
				 })
				await newData1.save()
			await	 interaction.reply({content: 'Set to true 1'})
			 } else if (data){
				await devModel.findOneAndUpdate({
					_id: 1,
				
				 }, {status: 'true'})
			
			await	 interaction.reply({content: 'Set to true'})
			 }
			 
		 }

		 if (interaction.options.getString('value') == "false") {
			 if(!data) {
				const newData1 = new devModel({
					 _id: 1,
					 status: ffalse	 })
				await newData1.save()
			await	 interaction.reply({content: 'Set to false 1'})
			 } else if (data){
			await devModel.findOneAndUpdate({
					_id: 1,
					 
				 }, {status: 'false'}
				 )
			
			interaction.reply({content: 'Set to false'})
					
			 }
			 
		 }
   
   }
   
   
   
}