const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    room:{
        type: String,
        required: true,
    },
    name:{
        type: String,
        required: true,
    },
    msg: String,
    gif: String,
    createdAt: String,
    userId: String,
    userImg: {
        type: String
    }
});

module.exports = mongoose.model('Chat',chatSchema);