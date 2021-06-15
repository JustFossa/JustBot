const { inspect } = require('util');

module.exports = {
	name: 'eval',
	description: 'Eval command for the developers',
	usage: '',
	example: '2+2',
	aliases: ['e'],
	category: 'Owner Only',
	async execute({ config: { owners: owner }, message, args, client }) {
		const owners = Object.values(owner);
		if (!owners.includes(message.author.id) || message.guild.id !== '827257197565837312') {
			return;
		}

		const code = args.join(' ');
		if (!code) return;
		const token = message.client.token.split('').join('[^]{0,2}');
		const rev = message.client.token.split('').reverse().join('[^]{0,2}');
		const filter = new RegExp(`${token}|${rev}`, 'g');

		try {
			let output = eval(code); // eslint-disable-line
			if (output instanceof Promise || (Boolean(output) && typeof output.then === 'function' && typeof output.catch === 'function')) output = await output;

			output = inspect(output, { depth: 0, maxArrayLength: null });
			output = output.replace(filter, '--🙄--');
			output = this.clean(output);

			if (output.length < 1950) {
				return message.channel.send(`\`\`\`js\n${output}\n\`\`\``);
			}
			return message.channel.send(`${output}`, { split: '\n', code: 'js' });
		} catch (error) {
			return message.channel.send(`The following error occured \`\`\`js\n${error}\`\`\``);
		}
	},

	clean(text) {
		return text
			.replace(/`/g, `\`${String.fromCharCode(8203)}`)
			.replace(/@/g, `@${String.fromCharCode(8203)}`);
	}
};
