const express = require('express');
const Post = require('../schemas/post');
const User = require('../schemas/user');
const Review = require('../schemas/review');
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
        res.status(400).json({ msg: 'mypage error' });
        next(err);
    }
});

// 참여한 운동
router.get('/myPage/myExercise', authMiddleware, async (req, res) => {
    const { user } = res.locals;
    const { userId } = user;

    try {
        const myExcersie = await nowMember.find({ userId });
        res.status(200).json({ myExcersie });
    } catch (err) {
        res.status(400).json({ msg: 'myExcersie error' });
        next(err);
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
        res.status(400).json({ msg: 'mypage post error' });
        next(err);
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
        res.status(400).json({ msg: 'myPost error' });
        next(err);
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
        const regexr = /^[a-zA-Z0-9ㄱ-ㅎ|ㅏ-ㅣ|가-힣]*$/;

        // 기존 프로필 이미지와 새로운 프로필 이미지가 잘 들어가는지 확인

        if (!newUserImg) {
            newUserImg = user.userImg;
        }
        if (!regexr.test(nickName, userContent)) {
            return res.status(403).send('특수문자를 사용할 수 없습니다');
        }
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
    }
);

module.exports = router;
