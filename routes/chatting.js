const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');
const Room = require('../schemas/room');

router.get('/chatting', authMiddleware, async (req, res) => {
    const { user } = res.locals;
    const userId = user.userId;

    try {
        const chatting = await Room.find(
            { userId },
            {
                postTitle: 1,
                postDesc: 1,
                datemate: 1,
                nickName: 1,
                userImg: 1,
                status: 1,
                maxMember: 1,
                nowMember: 1,
                longitude: 1,
                latitude: 1,
                createdAt: 1,
                spot: 1,
                postCategory: 1,
                memberAge: 1,
                memberGender: 1,
            }
        ).sort({ $natural: -1 });

        res.status(200).json({ chatting });
    } catch (err) {
        console.log(err);
        res.status(400).send({
            errorMessage: '채팅방불러오기 오류'
        });
    }
});

module.exports = router;