const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    id: String,
    isGoing: [String]
})

module.exports = mongoose.model("Bar", schema)