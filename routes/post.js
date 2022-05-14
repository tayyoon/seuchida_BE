const express = require('express');
const Post = require('../schemas/post');
const User = require('../schemas/user');
const router = express.Router();
const moment = require('moment');
const authMiddleware = require('../middlewares/auth-middleware');
const Review = require('../schemas/review');
const Room = require('../schemas/room');
const { v4 } = require('uuid');

// 전체(메인)게시글 조회
router.get('/postList', authMiddleware, async (req, res, next) => {
    const { user } = res.locals;
    const { userId, address } = user;
    const categoryPost = [];

    // 카테고리 등록한것중에서 최신순 6개 (카테고리 구분없이 전체로)
    try {
        const totalList = await Post.find({ address });
        const likeThing = await User.find({ userId }, { userInterest: 1 });

        for (let i = 0; i < likeThing[0].userInterest.length; i++) {
            // 관심카테고리에 있는 카테고리들을 반복문으로 돌려서 토탈리스트의 카테고리 값과 동일한것이 있으면 토탈리스트의 포스트 아이디를 담는다.
            for (let j = 0; j < totalList.length; j++) {
                if (
                    likeThing[0].userInterest[i] === totalList[j].postCategory
                ) {
                    const likeThingsPost = await Post.findOne(
                        {
                            _id: totalList[j]._id,
                        },
                        {
                            userImg: 1,
                            longitude: 1,
                            latitude: 1,
                            postTitle: 1,
                            postDesc: 1,
                            postCategory: 1,
                            createdAt: 1,
                            status: 1,
                        }
                    );
                    categoryPost.push(likeThingsPost);
                }
            }
        }
        // 최신순으로 정렬해주기 위해 a,b로 하나씩 빼서 두개를 비교해가며 정렬 후 원하는 갯수만큼 slice
        const caPost = categoryPost
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 6);

        // 작성된 전체 리뷰 최신순으로 넘기기
        const filterReview = [];
        const allReviews = await Review.find(
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
        for (let i = 0; i < allReviews.length; i++) {
            if (allReviews[i].reviewImg) {
                filterReview.push(allReviews[i]);
            }
        }

        const filterRe = filterReview
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 8);

        // 유저의 주소중 본인의 시,구 를 기준으로 카테고리상관없이 전체목록 최신순으로 넘겨주기
        const nearByPosts = await Post.find(
            { address },
            {
                postTitle: 1,
                postDesc: 1,
                datemate: 1,
                status: 1,
                maxMember: 1,
                nowMember: 1,
                longitude: 1,
                latitude: 1,
                createdAt: 1,
            }
        ).sort({ $natural: -1 });

        const nearPost = nearByPosts
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);

        // console.log('carpost', caPost);
        // console.log('필터링리뷰', filterRe);
        // console.log('nearPost', nearPost);
        res.status(200).json({ caPost, nearPost, filterRe });
    } catch (err) {
        console.log(err);
        res.status(400).send(' 메인 뽑아서 넘기기 포스트 오류');
    }
});

// 근처 전체 리스트
router.get('/nearPostList', authMiddleware, async (req, res) => {
    const { user } = res.locals;
    const { address } = user;

    try {
        const nearPosts = await Post.find(
            { address },
            {
                postTitle: 1,
                postDesc: 1,
                datemate: 1,
                nickName: 1,
                userImg: 1,
                status: 1,
                maxMember: 1,
                nowMember: 1,
                longitude: 1,
                latitude: 1,
                createdAt: 1,
                spot: 1,
                postCategory: 1,
                memberAge: 1,
                memberGender: 1,
            }
        ).sort({ $natural: -1 });

        res.status(200).json({ nearPosts });
    } catch (err) {
        console.log(err);
        res.status(400).send('본인위치 근처 전체 포스트 오류');
    }
});

// 상세페이지 조회
router.get('/postDetail/:postId', authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const post = await Post.findOne({ _id: postId });
    const { nowMember } = post;

    // 참여자들의 정보 같이 넘기기
    const membersId = [];
    for (let i = 0; i < nowMember.length; i++) {
        const user = nowMember[i].memberId;
        membersId.push(user);
    }

    res.status(200).json({ post });
});

// 참여버튼
router.post('/postPush/:postId', authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const { user } = res.locals;
    const {
        userId,
        userImg,
        nickName,
        userGender,
        userAge,
        userInterest,
        userContent,
    } = user;
    const userInfo = {
        memberId: userId,
        memberImg: userImg,
        memberNickname: nickName,
        memberGen: userGender,
        memberAgee: userAge,
        memberCategory: userInterest,
        memberDesc: userContent,
    };

    const alreadymem = await Post.findOne({ _id: postId });
    let a = 0;
    let b = 0;

    for (let i = 0; i < alreadymem.nowMember.length; i++) {
        if (userId === alreadymem.nowMember[i].memberId) {
            a = a + 1;
        } else {
            b = b + 1;
        }
    }
    if (a >= 1) {
        res.status(401).json({
            errormessage: '참여에 실패하였습니다.',
        });
    } else if (b >= 1) {
        const NMember = await Post.updateOne(
            { _id: postId },
            { $push: { nowMember: userInfo } }
        );

        const newPostInfo = await Post.findOne({ _id: postId });
        const userPush = await User.updateMany(
            { userId },
            { $push: { pushExercise: postId } }
        );
        const thisPost = await Post.findOne({ _id: postId });
        if (thisPost.maxMember === thisPost.nowMember.length) {
            await Post.updateOne({ _id: postId }, { $set: { status: false } });
        }
        // console.log('디스포스트 맥스맴버', thisPost.maxMember);
        // console.log('디스포스트 나우맴버 랭스', thisPost.nowMember.length);
        res.status(200).json({ newPostInfo });
    }
});

//게시글 작성
router.post('/postWrite', authMiddleware, async (req, res) => {
    //작성한 정보 가져옴
    const {
        postTitle,
        postDesc,
        postCategory,
        datemate,
        maxMember,
        memberGender,
        address,
        spot,
        latitude,
        longitude,
        memberAge,
        status,
    } = req.body;

    // 사용자 브라우저에서 보낸 쿠키를 인증미들웨어통해 user변수 생성, 구조분해할당으로 인식이 되지않아 구조분해할당 해제
    const { user } = res.locals;
    const usersId = user.userId;
    const userImg = user.userImg;
    const nickName = user.nickName;
    const userGender = user.userGender;
    const userAge = user.userAge;
    const userInterest = user.userInterest;
    const userContent = user.userContent;

    // 글작성시각 생성
    require('moment-timezone');
    moment.tz.setDefault('Asia/Seoul');
    const createdAt = String(moment().format('YYYY-MM-DD HH:mm:ss'));
    const uuid = () => {
        const tokens = v4().split('-');
        return tokens[2] + tokens[1] + tokens[0] + tokens[3] + tokens[4];
    };
    const roomId = uuid();
    try {
        const postList = await Post.create({
            userId: usersId,
            nickName,
            userImg,
            userAge,
            postTitle,
            postDesc,
            postCategory,
            datemate,
            maxMember,
            nowMember: {
                memberId: usersId,
                memberImg: userImg,
                memberNickname: nickName,
                memberGen: userGender,
                memberAgee: userAge,
                memberCategory: userInterest,
                memberDesc: userContent,
            },
            memberGender,
            userGender,
            address,
            spot,
            latitude,
            longitude,
            createdAt,
            memberAge,
            status,
            roomId,
        });
        await Room.create({
            roomId,
            postTitle,
            maxMember,
            owner: usersId,
            ownerImg: userImg,
            createdAt,
        });

        res.send({ result: 'success', postList });
    } catch (error) {
        console.log(error);

        res.status(400).send({ msg: '게시글이 작성되지 않았습니다.' });
    }
});

// 게시글 삭제
router.delete('/postDelete/:postId', authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const { user } = res.locals;
    const { userId } = user;

    try {
        await Post.deleteOne({ _id: postId });
        await Room.deleteOne({ postId });
        await Review.deleteMany({ postId });

        res.send(200).json({ result: 'success' });
    } catch (error) {
        console.error(error);
        res.status(400).send({ msg: '게시글이 삭제되지 않았습니다.' });
    }
});

module.exports = router;
