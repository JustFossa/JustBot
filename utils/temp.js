function temp(message, time = 3000) {
	return message.delete({ timeout: time }).catch(() => null);
}

function asyncTemp(promise, time) {
	return promise.then(m => temp(m, time));
}

module.exports = {
	name: 'temp',
	construct(client) {
		return {
			temp,
			asyncTemp
		};
	}
};
