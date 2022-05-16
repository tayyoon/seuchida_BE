const mongoose = require('mongoose');

const NowSchema = new mongoose.Schema({
    postId: {
        type: String,
    },
    memberId: { 
        type: String,
    },
    memberImg: {
        type: String,
    },
    memberNickname: {
        type: String,
        // required: true,
    },
    memberGen: {
        type: String,
        // required: true,
    },
    memberAgee: {
        type: Number,
        // required: true,
    },
    memberCategory: {
        type: [],
        // required: true,
    },
    memberDesc: {
        type: String,
        // required: true,
    },
});

module.exports = mongoose.model('Now', NowSchema);