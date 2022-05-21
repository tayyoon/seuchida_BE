require('dotenv').config();
const express = require('express');
const Myex = require('../schemas/myexercise');
const User = require('../schemas/user');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/auth-middleware');
const upload = require('../S3/s3');
const Joi = require('joi');
const AWS = require('aws-sdk');
const myexercise = require('../schemas/myexercise');
const s3 = new AWS.S3();

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
            const token = jwt.sign({ userId }, process.env.MY_KEY);

            result = {
                token,
                userInfo,
            };
            res.send({ user: result });
        }
    )(req, res, next);
};

router.get('/callback/kakao', kakaoCallback);

//* 구글로 로그인하기 라우터 ***********************
router.get(
    '/oauth/google',
    passport.authenticate('google', {
        scope: ['profile'],
        // access_Type: 'offline',
        // approval_Prompt: 'force',
    })
); // 프로파일과 이메일 정보를 받는다.
//? 위에서 구글 서버 로그인이 되면, 네이버 redirect url 설정에 따라 이쪽 라우터로 오게 된다. 인증 코드를 박게됨

router.get(
    '/oauth/callback/google',
    passport.authenticate('google', { failureRedirect: '/' }), //? 그리고 passport 로그인 전략에 의해 googleStrategy로 가서 구글계정 정보와 DB를 비교해서 회원가입시키거나 로그인 처리하게 한다.
    (req, res) => {
        res.redirect('/');
    }
);

// const postUsersSchema = Joi.object({
//     nickName: Joi.string()
//         .required()
//         .min(2)
//         .max(12)
//         .pattern(new RegExp('^[a-zA-Z0-9ㄱ-ㅎ|ㅏ-ㅣ|가-힣]*$')),
//     userAge: Joi.string().required(),
//     userGender: Joi.string().required(),
//     userInterest: Joi.string().required(),
//     userContent: Joi.string().required(),
//     address: Joi.string().required(),
// });
//회원가입
router.post(
    '/signUp',
    upload.single('userImg'),
    authMiddleware,
    async (req, res) => {
        // try {
        const {
            nickName,
            userAge,
            userGender,
            userContent,
            userInterest,
            address,
        } = req.body;
        // await postUsersSchema.validateAsync(req.body);
        // const regexr = /^[a-zA-Z0-9ㄱ-ㅎ|ㅏ-ㅣ|가-힣\s]*$/;
        // if (!regexr.test(userContent)) {
        //     return res.status(403).send('특수문자를 사용할 수 없습니다');
        // }
        const { user } = res.locals;
        let userId = user.userId;
        let userImg = req.file?.location;
        //유저이미지를 안줫을때 디폴트 이미지를 넣어줌
        if (!userImg) {
            userImg = process.env.DEFAULT_IMG;
        }
        let userEvalue = Number(10);
        let level = Number(2);
        //userId가 db에 존재하지않을 때 회원가입실패 메시지 송출
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
                    userEvalue,
                    level,
                },
            }
        );
        // await Evalue.create({
        //     userId,
        //     userEvalue: [
        //         { good1: 0 },
        //         { good2: 0 },
        //         { good3: 0 },
        //         { bad1: 0 },
        //         { bad2: 0 },
        //         { bad3: 0 },
        //     ],
        // });
        res.status(201).send({
            message: '가입완료',
        });
        // } catch (err) {
        //     console.log(err);
        //     res.status(400).send({
        //         errorMessage: '요청한 데이터 형식이 올바르지 않습니다.',
        //     });
        // }
    }
);

//회원탈퇴
router.delete('/signDown', authMiddleware, async (req, res) => {
    const { user } = res.locals;
    let userId = user.userId;
    
    const deleteImgURL = userInfo[0].userImg;
    //db에 있는 userImgURL에서 s3버킷의 파일명으로 분리
    const deleteImg = deleteImgURL.split('/')[3];
    await Myex.deleteMany({ userId })
    await User.deleteOne({ userId: userId });
    s3.deleteObject(
        {
            Bucket: process.env.BUCKET_NAME,
            Key: deleteImg,
        },
        (err, data) => {
            if (err) {
                throw err;
            }
        }
    );    
    res.status(201).send({
        message: '탈퇴완료',
    });
});

module.exports = router;
