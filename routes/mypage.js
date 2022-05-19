const express = require('express');
const Post = require('../schemas/post');
const User = require('../schemas/user');
const Review = require('../schemas/review');
const Chat = require('../schemas/chatting');
const Room = require('../schemas/room');
const NowMember = require('../schemas/nowMember');
const router = express.Router();
const upload = require('../S3/s3');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const jwt = require('jsonwebtoken');
const moment = require('moment');
//multer-s3 미들웨어 연결
require('dotenv').config();
const authMiddleware = require('../middlewares/auth-middleware');

// 마이페이지
router.get('/myPage', authMiddleware, async (req, res) => {
    const { user } = res.locals;
    const { userId } = user;

    try {
        const myPage = await User.find({ userId });
        res.status(200).json({ myPage });
    } catch (err) {
        console.log('마이페이지 에이피아이', err);
        res.status(400).json({ msg: 'mypage error' });
    }
});

// 참여한 운동
router.get('/myPage/myExercise', authMiddleware, async (req, res, next) => {
    const { user } = res.locals;
    const { userId } = user;

    let myEx = [];
    try {
        const pushEx = await User.findOne({ userId }, { pushExercise: 1 });
        for (let i = 0; i < pushEx.pushExercise.length; i++) {
            let postEx = await Post.findOne({ roomId: pushEx.pushExercise[i] });
            const userInfo = await User.findOne({
                userId
            })
            postEx['nickName'] = `${userInfo.nickName}`;
            postEx['userAge'] = `${userInfo.userAge}`;
            postEx['userGender'] = `${userInfo.userGender}`;
            postEx['userImg'] = `${userInfo.userImg}`;

            let nowmemberId = [];
            let nowMember = '';
            for(let i=0; i<postEx.nowMember.length; i++){
                nowmemberId.push(postEx.nowMember[i])
            }
            postEx['nowMember'] = [];
            for(let i=0; i<nowmemberId.length; i++) {
                nowMember = await User.findOne({
                    userId: nowmemberId[i]
                })
                nowInfo = {
                    memberId: nowMember.userId,
                    memberImg: nowMember.userImg,
                    memberNickname: nowMember.nickName,
                    memberAgee: nowMember.userAge,
                    memberGen: nowMember.userGender,
                    memberDesc: nowMember.userContent
                }
                postEx['nowMember'].push(nowInfo); 
            }
            myEx.push(postEx);
        }

        res.status(200).json({ myEx });
    } catch (err) {
        console.log('마이페이지 에이피아이2', err);
        res.status(400).json({ msg: 'myExercise error' });
    }
});

// 내가 쓴 글
router.get('/myPage/post', authMiddleware, async (req, res) => {
    const { user } = res.locals;
    const { userId } = user;

    try {
        const myPost = await Post.find({ userId });


        res.status(200).json({ myPost });
    } catch (err) {
        console.log('마이페이지 에이피아이3', err);
        res.status(400).json({ msg: 'mypage post error' });
    }
});

// 내가 쓴 리뷰
router.get('/myPage/myReview', authMiddleware, async (req, res) => {
    const { user } = res.locals;
    const { userId } = user;

    try {
        const myPost = await Review.find({ userId });
        res.status(200).json({ myPost });
    } catch (err) {
        console.log('마이페이지 에이피아이4', err);
        res.status(400).json({ msg: 'myPost error' });
    }
});

// 프로필 수정
router.post(
    '/myPage/update',
    authMiddleware,
    upload.single('newUserImg'),
    async (req, res) => {
        const { user } = res.locals;
        const userId = user.userId;
        let newUserImg = req.file?.location;

        const {
            nickName,
            userAge,
            userGender,
            address,
            userInterest,
            userContent,
        } = req.body;

        //특수문자 제한 정규식
        const regexr = /^[a-zA-Z0-9ㄱ-ㅎ|ㅏ-ㅣ|가-힣\s]*$/;
        const regexr1 = /^[a-zA-Z0-9ㄱ-ㅎ|ㅏ-ㅣ|가-힣]*$/;
        if (!regexr1.test(nickName)) {
            return res.status(403).send('특수문자를 사용할 수 없습니다');
        }
        if (!regexr.test(userContent)) {
            return res.status(403).send('특수문자를 사용할 수 없습니다');
        }
        // 기존 프로필 이미지와 새로운 프로필 이미지가 잘 들어가는지 확인

        if (newUserImg) {
            try {
                const myInfo = await User.find({ userId });

                // 현재 URL에 전달된 id값을 받아서 db찾음
                const url = myInfo[0].userImg.split('/');

                // video에 저장된 fileUrl을 가져옴
                const delFileName = url[url.length - 1];

                s3.deleteObject(
                    {
                        Bucket: process.env.BUCKET_NAME,
                        Key: delFileName,
                    },
                    (err, data) => {
                        if (err) {
                            throw err;
                        }
                    }
                );

                await Post.updateMany(
                    { userId },
                    {
                        $set: {
                            userImg: newUserImg,
                        },
                    }
                );

                const allPost = await Post.find({}, { nowMember: 1 });

                // for (let i = 0; i < allPost.length; i++) {
                //     const noo = allPost[i].nowMember[0][i].memberImg;
                //     console.log('^^^^^^^^^^^', allPost[i].nowMember[i]);

                //     await Post.updateMany(
                //         { : { memberId: userId } },
                //         { $set: { memberImg: newUserImg } }
                //     );
                // }

                await Review.updateMany(
                    { userId },
                    {
                        $set: {
                            userImg: newUserImg,
                        },
                    }
                );

                await NowMember.updateMany(
                    { memberId: userId },
                    {
                        $set: {
                            memberImg: newUserImg,
                        },
                    }
                );

                await Post.updateMany({ userId }, { userImg: newUserImg });

                await Room.updateMany(
                    { owner: userId },
                    {
                        $set: {
                            ownerImg: newUserImg,
                        },
                    }
                );

                await Chat.updateMany(
                    { userId },
                    { $set: { userImg: newUserImg } }
                );

                await User.updateOne(
                    { userId },
                    {
                        $set: {
                            nickName,
                            userAge,
                            userGender,
                            userContent,
                            userImg: newUserImg,
                            userInterest,
                            address,
                        },
                    }
                );
                res.status(200).send({
                    message: '수정 완료',
                });
            } catch (err) {
                console.error(err);
                res.status(400).send({
                    message: '수정 실패',
                });
            }
        } else {
            try {
                newUserImg = user.userImg;
                await User.updateOne(
                    { userId },
                    {
                        $set: {
                            nickName,
                            userAge,
                            userGender,
                            userContent,
                            userImg: newUserImg,
                            userInterest,
                            address,
                        },
                    }
                );
            } catch (err) {
                console.error(err);
                res.status(400).send({
                    message: '수정 실패',
                });
            }
        }
    }
);

module.exports = router;
