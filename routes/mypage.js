const express = require('express');
const Post = require('../schemas/post');
const User = require('../schemas/user');
const Review = require('../schemas/review');
const router = express.Router();
const upload = require('../S3/s3');
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
        const myPage = await User.find({userId});
            res.status(200).json({myPage});
    } catch (err) {
        res.status(400).json({ msg: 'mypage error' });
        next(err);
    }
});


// 참여한 운동 
router.get('/myExcersie', authMiddleware, async (req, res) => {
    const { user } = res.locals;
    const { userId } = user;

    try {
        const myExcersie = await nowMember.find({userId});
            res.status(200).json({myExcersie});
    } catch (err) {
        res.status(400).json({ msg: 'myExcersie error' });
        next(err);
    }
});

// 내가 쓴 글
router.get('/myPage/myPost', authMiddleware, async (req, res) => {
    const { user } = res.locals;
    const { userId } = user;

    try {
        const myPost = await Post.find({userId});
            res.status(200).json({myPost});
    } catch (err) {
        res.status(400).json({ msg: 'myPost error' });
        next(err);
    }
});


// 내가 쓴 리뷰
router.get('/myPage/myReview', authMiddleware, async (req, res) => {
    const { user } = res.locals;
    const { userId } = user;

    try {
        const myPost = await Review.find({userId});
            res.status(200).json({myPost});
    } catch (err) {
        res.status(400).json({ msg: 'myPost error' });
        next(err);
    }
});

// 프로필 수정
router.post( '/hostUpdate/:postId', authMiddleware, async (req, res) => {
    const { user } = res.locals.user;

    const { nickName, address, userContent } = req.body;


    try {
        await User.updateOne(
            { $set: {
              nickName,
              userAge,
              gender, 
              userContent, 
              userImg, 
              userInterest, 
              address
            }
        });
        res.status(200).send({
          message: '수정 완료',
        });
    } catch (err) {
      res.status(400).send({
        message: '수정 실패',
      });
    }
  }
);


module.exports = router;