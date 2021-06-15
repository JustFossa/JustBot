const mongoose = require('mongoose');

const subscriptionSchema = require('./subscriptionSchema');

module.exports = mongoose.model('subscription', subscriptionSchema);
