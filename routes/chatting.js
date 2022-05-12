const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');
const Room = require('../schemas/room');

router.get('/chatting', authMiddleware, async (req, res) => {
    const { user } = res.locals;
    const userId = user.userId;
    //채팅의 마지막내용, 채팅시간, 그사람이 들어가있는 룸들을 다 보내주기, 룸안에 들어있는 유저들의 정보도 같이 보내주기
    try {
        const chattingRoom = await Room.find({ 
            $or: [ {userList: [userId]}, {owner: userId} ] 
        });

        res.status(200).json({ chattingRoom });
    } catch (err) {
        console.log(err);
        res.status(400).send({
            errorMessage: '채팅방불러오기 오류'
        });
    }
});

module.exports = router;