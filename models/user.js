const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: String,
    twitterId: String
})

module.exports = mongoose.model("User", schema)