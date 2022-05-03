const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    userId: {
        type: String,
        // required: true,
        // unique: true
    },
    nickName: {
        type: String,
        // required: true,
    },
    userAge: {
        type: String,
    },
    userGender: {
        type: String,
        // required: true,
    },
    category: {
        type: String,
    },
    userContent: {
        type: String,
    },

    userImg: {
        type: String,
    },
    userInterest: {
        type: Array,
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
