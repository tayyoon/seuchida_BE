const mongoose = require('mongoose');

const chatRoom = new mongoose.Schema({
    postId: {
        type: String,
        required: true,
    },
    postUserId: {
        type: String,
        required: true,
    },
    memberId: {
        type: String,
        required: true,
    },
    userOkay: {
        type: Boolean,
        default: false,
    },
    memberOkay: {
        type: Boolean,
        default: false,
    },
});

// [{a:"보이시나요"},{b:"아무래도그런편이죠"}]
// 실제로 소켓 구현할때 좀 변할수도있음

module.exports = mongoose.model('ChatRoom', chatRoom);
