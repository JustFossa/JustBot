const mongo = require('../mongo')
const dotenv = require('dotenv');

dotenv.config();

const { loadLanguages } = require('../language')

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

        await mongo().then(mongoose => {
            try {
                console.log('Connected to mongo!');
            } finally {
                mongoose.connection.close();
            }
        });

        loadLanguages(client);
	},
};