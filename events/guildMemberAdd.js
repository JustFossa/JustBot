const Canvas = require("canvas")
const {MessageAttachment, MessageEmbed} = require("discord.js")

module.exports = {
name: "guildMemberAdd",
async execute(member, guild) {

    
    const canvas = Canvas.createCanvas(700, 250);
		const context = canvas.getContext('2d');

        const background = await Canvas.loadImage('./bg.jpg');

        context.drawImage(background, 0, 0, canvas.width, canvas.height);
        context.fillStyle = "rgba(0, 0, 0, 0.6)";
       context.fillRect(0, 0, 700, 250)
        context.strokeStyle = '#0099ff';

	
	        context.strokeRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = '#ffffff' // White text
    context.font = '26px Sans'
    context.fillText(` ${member.user.tag}`, canvas.width / 3, canvas.height / 3)
       context.fillStyle = '#ffffff'
       context.font = '30px Sans'
       context.fillText(`You are member N°${member.guild.members.cache.size}`, canvas.width / 3, canvas.height / 1.44)

                context.beginPath();


                    context.arc(125, 125, 100, 0, Math.PI * 2, true);


                    context.closePath();


                    context.clip();

                    const avatar = await Canvas.loadImage(member.displayAvatarURL({ format: 'jpg' }));


                    context.drawImage(avatar, 25, 25, 200, 200);

                   
        const attachment = new MessageAttachment(canvas.toBuffer(), 'welcome.png');

        const welcEmbed = new MessageEmbed()
                .setImage('attachment://welcome.png')
                .setColor("ORANGE")
if(member.id !== "736646349306593401") {
    member.guild.channels.cache.find(channel => channel.id == "901944859391316028").send({embeds: [welcEmbed], files: [attachment]})
}
        


const joinrole = member.guild.roles.cache.find(role => role.id == "901947393870807071")
    if(!member.bot) {
        await member.roles.add(joinrole.id)
    }



}}