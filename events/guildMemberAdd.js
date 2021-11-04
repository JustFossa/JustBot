const Canvas = require("canvas")
const {MessageAttachment, MessageEmbed} = require("discord.js")

module.exports = {
name: "guildMemberAdd",
async execute(member, guild) {

    
    const canvas = Canvas.createCanvas(700, 250);
		const context = canvas.getContext('2d');

        const background = await Canvas.loadImage('./bg.jpg');

        context.drawImage(background, 0, 0, canvas.width, canvas.height);

        context.strokeStyle = '#0099ff';

	
	        context.strokeRect(0, 0, canvas.width, canvas.height);

            context.font = '60px sans-serif';

            // Select the style that will be used to fill the text in
            context.fillStyle = '#ffffff';
        
            // Actually fill the text with a solid color
            context.fillText(member.user.tag, canvas.width / 2.5, canvas.height / 1.8);

                context.beginPath();


                    context.arc(125, 125, 100, 0, Math.PI * 2, true);


                    context.closePath();


                    context.clip();

                    const avatar = await Canvas.loadImage(member.displayAvatarURL({ format: 'jpg' }));


                    context.drawImage(avatar, 25, 25, 200, 200);

                   
        const attachment = new MessageAttachment(canvas.toBuffer(), 'welcome.png');

        const welcEmbed = new MessageEmbed()
                .setImage('attachment://welcome.png')
                .setColor("BLURPLE")

        member.guild.channels.cache.find(channel => channel.id == "901944859391316028").send({embeds: [welcEmbed], files: [attachment]})

 console.log(`${member.user.tag} has joined the server!`)

const joinrole = member.guild.roles.cache.find(role => role.id == "901947393870807071")

await member.roles.add(joinrole.id)


}}