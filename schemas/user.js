const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    nickName: {
        type: String,
        required: true,
    },
    userAge: {
        type: String,
        required: true,
    },
    userGender: {
        type: String,
        required: true,
    },
    userContent: {
        type: String,
        required: true,
    },
    userImg: {
        type: String,
        required: true,
    },
    userInterest: {
        type: Array,
    },
    address: {
        type: String,
        required: true,
    },
    reviewCnt: {
        type: Number,
    },
    like: {
        type: Array,
    },
});
module.exports = mongoose.model('User', UserSchema);
