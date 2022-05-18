const express = require('express');
const Post = require('../schemas/post');
const Review = require('../schemas/review');
const User = require('../schemas/user');
const Report = require('../schemas/report');
const router = express.Router();
const moment = require('moment');
const upload = require('../S3/s3');
const authMiddleware = require('../middlewares/auth-middleware');

// 리뷰 포스트 정보
router.get('/reviewPost/:postId', authMiddleware, async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Post.findOne({ _id: postId });
        res.status(200).json({ result: 'success', post });
    } catch (error) {
        console.log(error);
        res.status(400).send({ msg: '리뷰작성전 포스트 가져가기 실패' });
    }
});

// 리뷰 등록
router.post(
    '/review/:postId',
    upload.single('image'),
    authMiddleware,
    async (req, res) => {
        const postId = req.params.postId;
        const post = await Post.findOne({ _id: postId });
        const { user } = res.locals;
        const { userId, nickName, userAge } = user;
        const { userImg } = user;
        const { spot, address, postCategory } = post;
        const { content, evalues, otherId } = req.body; 
        const image = req.file?.location; 
        console.log(otherId)
        console.log(evalues)
        let checkUserId = '';
        let checkEvalue = 0;
        let userInfo1 = '';
        let userInfo2 = '';
        let evalue = 0;
        require('moment-timezone');
        moment.tz.setDefault('Asia/Seoul');
        const createdAt = String(moment().format('YYYY-MM-DD HH:mm:ss'));
        try {
            const reviewList = await Review.create({
                postId: postId,
                userId,
                nickName,
                userImg,
                userAge,
                reviewImg: image,
                content,
                createdAt,
                address,
                spot,
                postCategory,
            });
            for(let i=0; i<otherId.length; i++) {
                checkUserId = otherId[i];
                checkEvalue = evalues[i];
                userInfo1 = await User.findOne({
                    userId: checkUserId
                });
                evalue = Number(userInfo1.userEvalue) + Number(checkEvalue) //후기 작성하나에 얼마나 올려줄지 정해야함
                userInfo2 = await User.updateOne(
                    { userId: checkUserId },
                    {
                        $set: {
                            userEvalue: evalue
                        }
                    }
                );
            };
            res.status(200).json({ result: 'success', reviewList });
        } catch (error) {
            console.log(error);
            res.status(400).send({ msg: '리뷰가 작성되지 않았습니다.' });
        }
    }
);

// 전체리뷰 조회
router.get('/review', authMiddleware, async (req, res) => {
    try {
        let allReviews = await Review.find(
            {},
            {
                userImg: 1,
                content: 1,
                nickName: 1,
                reviewImg: 1,
                spot: 1,
                postCategory: 1,
                createdAt: 1,
            }
        ).sort({ $natural: -1 });
        // 전체 리뷰를 조회하되 프론트에서 필요한 정보만을 주기위해 key:1(true) 를 설정해줌
        // sort()함수에 $natural:-1 을 시켜 저장된 반대로 , 최신순으로 정렬시킴

        res.status(201).send(allReviews);
    } catch (error) {
        console.error(error);
        res.status(401).send('리뷰 전체조회 실패');
    }
});

// 리뷰 조회
router.get('/review/:reviewId', authMiddleware, async (req, res) => {
    const { reviewId } = req.params;
    try {
        const reviews = await Review.find({ _id: reviewId });
        res.status(200).json({ reviews });
    } catch (error) {
        console.log(error);
        res.status(400).send('댓글이 조회되지 않았습니다!');
    }
});

// 리뷰 삭제
router.delete('/review/:reviewId', authMiddleware, async (req, res) => {
    const { reviewId } = req.params;
    const review = await Review.find({ _id: postId });

    const url = review[0].reviewImg.split('/');
    const delFileName = url[url.length - 1];
    try {
        await Review.deleteOne({ _id: reviewId });

        s3.deleteObject(
            {
                Bucket: 'practice2082',
                Key: delFileName,
            },
            (err, data) => {
                if (err) {
                    throw err;
                }
            }
        );
        res.send({ result: 'success' });
    } catch {
        res.status(400).send({ msg: '리뷰가 삭제되지 않았습니다.' });
    }
});
//신고하기
router.post('/report', authMiddleware, async (req, res) => {
    const { userId, content }= req.body;
    await Report.create({
        userId,
        content
    });
    const userInfo = await User.findOne({
        userId
    });
    let evalue = Number(userInfo.userEvalue)- Number(3)
    await User.updateOne(
        { userId },
        {
            $set: {
                userEvalue: evalue
            }
        }
    )
    res.send({ result: 'success' });
});

module.exports = router;
