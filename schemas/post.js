const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    postTitle: {
        type: String,
        required: true,
    },
    postDesc: {
        type: String,
        required: true,
    },
    postCategory: {
        type: String,
        required: true,
    },
    datemate: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    nickName: {
        type: String,
        // required: true,
    },
    userAge: {
        type: String,
        required: true,
    },
    userGender: {
        type: String,
        required: true,
    },
    userImg: {
        type: String,
        required: true,
    },
    maxMember: {
        type: Number,
        required: true,
    },
    nowMember: {
        type: [
            {
                memberId: { type: String },
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
            },
        ],
        required: true,
    },
    memberGender: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    spot: {
        type: String,
        required: true,
    },
    latitude: {
        type: Number,
        required: true,
    },
    longitude: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: String,
        required: true,
    },
    memberAge: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        default: true,
        required: true,
    },
});

PostSchema.virtual('PostId').get(function () {
    return this._id.toHexString();
});
PostSchema.set('toJSON', {
    virtuals: true,
});

module.exports = mongoose.model('Posts', PostSchema);
