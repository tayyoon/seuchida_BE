const express = require('express');
const Post = require('../schemas/post');
const User = require('../schemas/user');
const Review = require('../schemas/review');
const router = express.Router();
const moment = require('moment');
const upload = require('../S3/s3');
const authMiddleware = require('../middlewares/auth-middleware');

// 리뷰 등록
router.post(
    '/review/:postId',
    upload.single('image'),
    authMiddleware,
    async (req, res) => {
        const { postId } = req.params;
        const post = await Post.findOne({ postId });
        const { user } = res.locals;
        const { userId, nickName, userAge } = user;
        const { userImg } = user;
        const { spot, address, postCategory } = post;
        const { content } = req.body;
        const image = req.file?.location;

        require('moment-timezone');
        moment.tz.setDefault('Asia/Seoul');
        const createdAt = String(moment().format('YYYY-MM-DD HH:mm:ss'));
        try {
            const reviewList = await Review.create({
                postId,
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
            res.send({ result: 'success', reviewList });
        } catch (error) {
            console.log(error);
            res.status(400).send({ msg: '리뷰가 작성되지 않았습니다.' });
        }
    }
);

// 리뷰 조회
router.get('/review/:postId', authMiddleware, async (req, res) => {
    const { postId } = req.params;
    try {
        const reviews = await Review.find({ postId });
        res.status(200).json({ reviews });
    } catch (error) {
        console.log(error);
        res.status(400).send('댓글이 조회되지 않았습니다!');
    }
});

// 리뷰 삭제
router.delete('/review/:reviewId', authMiddleware, async (req, res) => {
    const { reviewId } = req.params;
    const reviewImg = await Review.find({ _id: postId }); // 현재 URL에 전달된 id값을 받아서 db찾음
    //console.log(postId)
    const url = reviewImg[0].image.split('/'); // video에 저장된 fileUrl을 가져옴
    const delFileName = url[url.length - 1];
    try {
        await Post.deleteOne({ _id: reviewId });
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

module.exports = router;
