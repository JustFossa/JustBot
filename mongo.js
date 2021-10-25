const mongoose = require('mongoose')
const dotenv = require('dotenv');

dotenv.config();

const mongoPath = process.env.MONGO_PATH;

module.exports = async () => {
    await mongoose.connect(mongoPath);
    return mongoose;
}