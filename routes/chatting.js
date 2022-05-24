const express = require('express');
const { json } = require('express/lib/response');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');
const Room = require('../schemas/room');
const Chat = require('../schemas/chatting');
const User = require('../schemas/user');
const Post = require('../schemas/post');

router.get('/chatting', authMiddleware, async (req, res) => {
    const { user } = res.locals;
    const userId = user.userId;
    //채팅의 마지막내용, 채팅시간, 그사람이 들어가있는 룸들을 다 보내주기, 룸안에 들어있는 유저들의 정보도 같이 보내주기
    try {
        const chattingRoom = await Room.find({
            $or: [ {nowMember: [userId]} ] 
        });
        for(let i=0; i<chattingRoom.length; i++) {
            const userInfo = await User.findOne({
                userId: chattingRoom[i].owner
            })
            chattingRoom[i]['ownerImg'] = `${userInfo.userImg}`;
        }
        let chattingRoomId = [];
        let lastChatting = [];
        for(let i=0; i<chattingRoom.length; i++) {
            chattingRoomId.push(chattingRoom[i].roomId)
        }
        for(i=0; i<chattingRoomId.length; i++) {
            let lastChatting1 = '';
            lastChatting1 = await Chat.findOne({
                room: chattingRoomId[i],
                name: { $ne: 'Systemback'}
            }).sort({ createdAt: -1 })
            lastChatting.push(lastChatting1)
        }
        
        res.status(200).json({ chattingRoom, lastChatting });
    } catch (err) {
        console.log(err);
        res.status(400).send({
            errorMessage: '채팅방불러오기 오류'
        });
    }
});

router.get('/chatUserList/:roomId', authMiddleware, async (req, res) => {
    const { roomId } = req.params;
    try{
        const roomInfo = await Room.findOne({ 
            roomId,
        });
        const nowMember = [];
        for(let i=0; i<roomInfo.nowMember.length; i++) {
            nowMember.push(
                await User.findOne({ 
                    userId: roomInfo.nowMember[i][0],
                })
            );
        };
        const checkPostId = await Post.findOne({
            roomId
        })
        const postId =checkPostId._id;
        const owner = checkPostId.userId
        res.status(200).json({ nowMember, postId, owner });
    } catch(err) {
        console.log(err);
        res.status(400).send({
            errorMessage: '채팅방 유저목록불러오기 오류'
        });
    }
});

module.exports = router;