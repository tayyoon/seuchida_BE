const mongoose = require('mongoose');

const myExSchema = new mongoose.Schema({
    roomId:{
        type: String,
    },
    userId:{
        type: String
    }
});

module.exports = mongoose.model('myEx',myExSchema);