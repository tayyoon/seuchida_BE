const express = require('express');
const Post = require('../schemas/post');
const User = require('../schemas/user');
const Evalue = require('../schemas/evalue');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const authMiddleware = require('../middlewares/auth-middleware');
const path = require('path');
const mykey = fs.readFileSync(path.resolve(__dirname, '../key.txt')).toString();
const upload = require('../S3/s3');
const evalue = require('../schemas/evalue');

router.get('/kakao', passport.authenticate('kakao'));

const kakaoCallback = (req, res, next) => {
    passport.authenticate(
        'kakao',
        { failureRedirect: '/' },
        (err, user, info) => {
            if (err) return next(err);
            console.log('콜백~~~');
            const userInfo = user;
            const { userId } = user;
            const token = jwt.sign({ userId }, mykey);

            result = {
                token,
                userInfo,
            };
            console.log(result);
            res.send({ user: result });
        }
    )(req, res, next);
};

router.get('/callback/kakao', kakaoCallback);

router.post(
    '/signUp',
    upload.single('userImg'),
    authMiddleware,
    async (req, res) => {
        const {
            nickName,
            userAge,
            userGender,
            userContent,
            userInterest,
            address,
        } = req.body;
        const { user } = res.locals;

        let userImg = req.file?.location;
        if (!userImg) {
            userImg =
                'https://practice2082.s3.ap-northeast-2.amazonaws.com/%EA%B8%B0%EC%98%81%EC%9D%B4.jpg';
        }

        let userId = user.userId;
        const existUsers = await User.find({
            $or: [{ userId }],
        });
        if (!existUsers) {
            res.status(401).send('회원가입실패');
        }
        await User.updateOne(
            { userId: userId },
            {
                $set: {
                    userAge,
                    nickName,
                    userImg,
                    userGender,
                    userContent,
                    userInterest,
                    address,
                },
            }
        );
        await Evalue.create({
            userId,
            userEvalue: [
                { good1: 0 },
                { good2: 0 },
                { good3: 0 },
                { bad1: 0 },
                { bad2: 0 },
                { bad3: 0 },
            ],
        });
        res.status(201).send({
            message: '가입완료',
        });
    }
);

module.exports = router;
