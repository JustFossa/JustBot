/* eslint-disable func-names */
const { TextChannel, Guild } = require('discord.js');

module.exports = client => {
	TextChannel.prototype.temp = function(message, options) {
		let time;
		if (options && options.time) {
			time = options.time;
			options.time = undefined;
			if (Object.values(options).filter(t => typeof t != 'undefined').length < 1) options = undefined;
		}
		client.utils.temp.asyncTemp(this.send(message, options), time);
	};

	Guild.prototype.log = function(message, options) {
		return client.utils.logger.log(message, this.id, options);
	};
};
