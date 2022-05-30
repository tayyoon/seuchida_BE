const mongoose = require('mongoose');
const moment = require('moment');

const roomSchema = new mongoose.Schema({
    postTitle:{
        type: String,
        required: true,
    },
    maxMember:{
        type: Number,
        required: true,
        defaultValue: 10,
        min: 1,
    },
    owner:{
        type: String,
        required: true,
    },
    ownerImg:{
        type: String,
    },
    createdAt:{
        type: String,
        default: moment().format("YYYY-MM-DD HH:mm:ss"),
    },
    nowMember: Array,
    banUserList: Array,
    roomId: {
        type: String
    }
});

module.exports = mongoose.model('Room',roomSchema);