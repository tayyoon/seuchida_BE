const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    nickName: {
        type: String,
    },
    userAge: {
        type: String,
    },
    userGender: {
        type: String,
    },
    userContent: {
        type: String,
    },
    userImg: {
        type: String,
    },
    userInterest: {
    },
    address: {
        type: String,
    },
    reviewCnt: {
        type: Number,
    },
    like: {
        type: Array,
    },
});
module.exports = mongoose.model('User', UserSchema);
