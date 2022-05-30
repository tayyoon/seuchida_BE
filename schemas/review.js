const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    postId: {
        type: String,
    },
    userId: {
        type: String,
        required: true,
    },
    nickName: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    userImg: {
        type: String,
    },
    reviewImg: {
        type: String,
    },
    createdAt: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    spot: {
        type: String,
    },
    postCategory: {
        type: String,
        required: true,
    },
});

ReviewSchema.virtual('ReviewId').get(function () {
    return this._id.toHexString();
});
ReviewSchema.set('toJSON', {
    virtuals: true,
});

module.exports = mongoose.model('Reviews', ReviewSchema);
