const express = require('express');
const Post = require('../schemas/post');
const Review = require('../schemas/review');
const Myex = require('../schemas/myexercise');
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
        let post = await Post.findOne({ _id: postId });
        const userInfo = await User.findOne({
            userId: post.userId
        })
        post['nickName'] = `${userInfo.nickName}`;
        post['userAge'] = `${userInfo.userAge}`;
        post['userGender'] = `${userInfo.userGender}`;
        post['userImg'] = `${userInfo.userImg}`;
    
        let nowmemberId = [];
        let nowMember = '';
        for(let i=0; i<post.nowMember.length; i++){
            nowmemberId.push(post.nowMember[i])
        }
        post['nowMember'] = [];
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
            post['nowMember'].push(nowInfo); 
        }
        
        res.status(200).json({ result: 'success', post });
    } catch (error) {
        console.log(error);
        res.status(400).send({ msg: '리뷰작성전 포스트 가져가기 실패' });
    }
});

// 리뷰 등록
router.post(
    '/review/:postId',
    authMiddleware,
    async (req, res) => {
        const postId = req.params.postId;
        const post = await Post.findOne({ _id: postId });
        const { user } = res.locals;
        const { userId } = user;
        const { spot, address, postCategory, roomId } = post;
        const { content, evalues, otherId, image } = req.body; 

        let checkUserId = '';
        let checkEvalue = 0;
        let userInfo1 = '';
        let userInfo2 = '';
        let userInfo3 = '';
        let evalue = 0;
        let upEvalue = 0;
        let eventEvalue = 0;
        require('moment-timezone');
        moment.tz.setDefault('Asia/Seoul');
        const createdAt = String(moment().format('YYYY-MM-DD HH:mm:ss'));
        try {
            //이미지첨부 후기글이면 5점 아니면 3점주기
            if(!image) {
                upEvalue = Number(3);
            } else {
                upEvalue = Number(5);
            }
            //첫 후기글일때 5점 주기
            const checkReview = await Review.find({
                userId
            });
            if(!checkReview){
                eventEvalue = Number(5);
            } else {
                eventEvalue = Number(0);
            }
            
            //내 평점추가
            userInfo3 = await User.findOne({
                userId
            });
            let selfEvalue = upEvalue + eventEvalue + Number(userInfo3.userEvalue)
            if(selfEvalue>=60) {
                level = 7
            } else if(selfEvalue>=50) {
                level = 6
            } else if(selfEvalue>=40) {
                level = 5
            } else if(selfEvalue>=30) {
                level = 4
            } else if(selfEvalue>=20) {
                level = 3
            } else if(selfEvalue>=10) {
                level = 2
            } else {
                level = 1
            }
            await User.updateOne(
                { userId },
                {  
                    $set: {
                        userEvalue: selfEvalue,
                        level
                    }
                }
            );
            //다른사람 평가
            for(let i=0; i<otherId.length; i++) {
                checkUserId = otherId[i];
                checkEvalue = evalues[i];
                if(!checkEvalue) {
                    checkEvalue = 0
                }
                userInfo1 = await User.findOne({
                    userId: checkUserId
                });
                evalue = Number(userInfo1.userEvalue) + Number(checkEvalue)
                userInfo2 = await User.updateOne(
                    { userId: checkUserId },
                    {
                        $set: {
                            userEvalue: evalue
                        }
                    }
                );
            };
            var reviewList = await Review.create({
                postId,
                userId,
                nickName: 'a',
                userImg: 'a',
                userAge: 'a',
                reviewImg: image,
                content,
                createdAt,
                address,
                spot,
                postCategory,
            });
            const userInfo = await User.findOne({
                userId
            })
            reviewList['nickName'] = `${userInfo.nickName}`;
            reviewList['userAge'] = `${userInfo.userAge}`;
            reviewList['userImg'] = `${userInfo.userImg}`;

            await Myex.updateOne(
                { roomId, userId },
                { $set: { writeReview: false } }
            )

            res.status(200).json({ result: 'success', reviewList });
        } catch (error) {
            console.log(error);
            res.status(400).send({ msg: '리뷰가 작성되지 않았습니다.' });
        }
    }
);

// 리뷰작성 api에서 이미지 업로드 api 빼내기
router.post(
    '/reviewImg',
    upload.single('image'),
    authMiddleware,
    async (req, res) => { 
        let image = req.file?.location; 
        res.status(200).json({ result: 'success', image });
    }
);

// 전체리뷰 조회 
router.get('/reviewAll/:pageNumber', authMiddleware, async (req, res) => {
    const { pageNumber } = req.params;
    try {
        let allReviews = await Review.find({}).sort({ $natural: -1 }).skip((pageNumber-1)*6).limit(6);
        // 전체 리뷰를 조회하되 프론트에서 필요한 정보만을 주기위해 key:1(true) 를 설정해줌
        // sort()함수에 $natural:-1 을 시켜 저장된 반대로 , 최신순으로 정렬시킴
        for(i=0; i<allReviews.length; i++) {
            const userInfo = await User.findOne({
                userId: allReviews[i].userId
            })
            allReviews[i]['nickName'] = `${userInfo.nickName}`;
            allReviews[i]['userAge'] = `${userInfo.userAge}`;
            allReviews[i]['userImg'] = `${userInfo.userImg}`;
        }
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
        var reviews = await Review.find({ _id: reviewId });
        
        for(let i =0; i<reviews.length; i++) {
            const userInfo = await User.findOne({
                userId: reviews[i].userId
            })
            reviews[i]['nickName'] = `${userInfo.nickName}`;
            reviews[i]['userAge'] = `${userInfo.userAge}`;
            reviews[i]['userImg'] = `${userInfo.userImg}`;
        }
        
        res.status(200).json({ reviews });
    } catch (error) {
        console.log(error);
        res.status(400).send('review 조회 에러');
    }
});

// 리뷰 삭제
router.delete('/review/:reviewId', authMiddleware, async (req, res) => {
    const { reviewId } = req.params;
    const review = await Review.find({ _id: reviewId });

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
    if(evalue>=60) {
        level = 7
    } else if(evalue>=50) {
        level = 6
    } else if(evalue>=40) {
        level = 5
    } else if(evalue>=30) {
        level = 4
    } else if(evalue>=20) {
        level = 3
    } else if(evalue>=10) {
        level = 2
    } else {
        level = 1
    }
    await User.updateOne(
        { userId },
        {
            $set: {
                userEvalue: evalue,
                level
            }
        }
    )
    res.send({ result: 'success' });
});

module.exports = router;
