const Canvas = require('canvas');
const Discord = require('discord.js');

class attach {
	static async welcomeimage(member) {
		if (!member) throw new TypeError('A member was not provided.');

		const username = member.user.username;
		const discrim = member.user.discriminator;

		const canvas = Canvas.createCanvas(700, 250);
		const ctx = canvas.getContext('2d');

		// background
		const background = await Canvas.loadImage('https://cdn.discordapp.com/attachments/854335205341790208/854340705782857738/fc980b6ec648175e3c8ac9e9f1ed57f2.jpg');
		ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

		const font = 'Manrope';

		ctx.font = `20px ${font}`;
		ctx.fillStyle = '#ffffff';
		ctx.textAlign = 'start';
		ctx.shadowBlur = 10;
		ctx.shadowColor = 'black';
		ctx.fillText('Welcome', 260, 100);

		const welcometextPosition = { width: 260, height: 150 };

		let fontSize = 55;
		ctx.font = `bold ${fontSize}px ${font}`;

		do {
			fontSize -= 1;
			ctx.font = `bold ${fontSize}px ${font}`;
		} while (ctx.measureText(`${username}#${discrim}!`).width > 430);

		ctx.fillStyle = '#ffffff';
		ctx.textAlign = 'start';
		ctx.fillText(`${username}`, welcometextPosition.width, welcometextPosition.height, 455);

		ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
		ctx.textAlign = 'start';
		ctx.fillText(
			`#${discrim}!`,
			ctx.measureText(`${username}`).width + welcometextPosition.width,
			welcometextPosition.height
		);

		ctx.shadowBlur = 0;
		ctx.beginPath();
		ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.clip();

		const avatar = await Canvas.loadImage(
			member.user.displayAvatarURL({ format: 'jpg' })
		);
		ctx.beginPath(); 
		ctx.strokeStyle = '#fffff';  // some color/style
		ctx.lineWidth = 2;
		ctx.drawImage(avatar, 25, 25, 200, 200);
		ctx.strokeRect(25, 25, 200, 200);

		return canvas.toBuffer();
	}

	static async leaveimage(member) {
		if (!member) throw new TypeError('A member was not provided.');

		const username = member.user.username;
		const discrim = member.user.discriminator;

		const canvas = Canvas.createCanvas(700, 250);
		const ctx = canvas.getContext('2d');

		// background
		const background = await Canvas.loadImage('https://cdn.discordapp.com/attachments/854335205341790208/854340705782857738/fc980b6ec648175e3c8ac9e9f1ed57f2.jpg');
		ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

		const font = 'Manrope';

		ctx.font = `20px ${font}`;
		ctx.fillStyle = '#ffffff';
		ctx.textAlign = 'start';
		ctx.shadowBlur = 10;
		ctx.shadowColor = 'black';
		ctx.fillText('GoodBye', 260, 100);

		const welcometextPosition = { width: 260, height: 150 };

		let fontSize = 55;
		ctx.font = `bold ${fontSize}px ${font}`;

		do {
			fontSize -= 1;
			ctx.font = `bold ${fontSize}px ${font}`;
		} while (ctx.measureText(`${username}#${discrim}!`).width > 430);

		ctx.fillStyle = '#ffffff';
		ctx.textAlign = 'start';
		ctx.fillText(`${username}`, welcometextPosition.width, welcometextPosition.height, 455);

		ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
		ctx.textAlign = 'start';
		ctx.fillText(
			`#${discrim}!`,
			ctx.measureText(`${username}`).width + welcometextPosition.width,
			welcometextPosition.height
		);

		ctx.shadowBlur = 0;
		ctx.beginPath();
		ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.clip();

		const avatar = await Canvas.loadImage(
			member.user.displayAvatarURL({ format: 'jpg' })
		);
		ctx.drawImage(avatar, 25, 25, 200, 200);

		return canvas.toBuffer();
	}
}

module.exports = attach;
