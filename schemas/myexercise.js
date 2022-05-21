const mongoose = require('mongoose');

const myExSchema = new mongoose.Schema({
    roomId:{
        type: String,
    },
    userId:{
        type: String
    },
    writeReview: {
        type: Boolean,
        default: true,
    },
});

module.exports = mongoose.model('myEx',myExSchema);