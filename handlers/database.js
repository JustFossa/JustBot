const mongoose = require('mongoose');

module.exports = client => {
	// mongoose connection
	mongoose.connect(client.config.database, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
		useFindAndModify: false
	});

	const db = mongoose.connection;
	db.once('open', async () => {
		console.log('Successfully connected to the database.');
	});
};
