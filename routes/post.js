const express = require('express');
const Post = require('../schemas/post');
const User = require('../schemas/user');
const Myex = require('../schemas/myexercise');
const Review = require('../schemas/review');
const Room = require('../schemas/room');
const router = express.Router();
const moment = require('moment');
const authMiddleware = require('../middlewares/auth-middleware');
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
                    var likeThingsPost = await Post.findOne(
                        {
                            _id: totalList[j]._id,
                        }
                    );
                    const userInfo = await User.findOne({
                        userId: likeThingsPost.userId
                    })
                    likeThingsPost['nickName'] = `${userInfo.nickName}`;
                    likeThingsPost['userAge'] = `${userInfo.userAge}`;
                    likeThingsPost['userGender'] = `${userInfo.userGender}`;
                    likeThingsPost['userImg'] = `${userInfo.userImg}`;
                    
                    categoryPost.push(likeThingsPost);
                }
            }
        }
        // 최신순으로 정렬해주기 위해 a,b로 하나씩 빼서 두개를 비교해가며 정렬 후 원하는 갯수만큼 slice
        const caPost = categoryPost
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 6);

        // 작성된 전체 리뷰 최신순으로 넘기기
        var filterReview = [];
        var allReviews = await Review.find({}).sort({ $natural: -1 });
        for (let i = 0; i < allReviews.length; i++) {
            if (allReviews[i].reviewImg) {
                const userInfo = await User.findOne({
                    userId: allReviews[i].userId
                })
                allReviews[i]['nickName'] = `${userInfo.nickName}`;
                allReviews[i]['userAge'] = `${userInfo.userAge}`;
                allReviews[i]['userImg'] = `${userInfo.userImg}`;
                filterReview.push(allReviews[i]);
            }
        }

        const filterRe = filterReview
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 8);

        var newNearByPosts = await Post.find(
            { address },
        ).sort({ $natural: -1 });
        //미리 유저 아이디 저장
        let nowmemberId2 = [];
        for(let i =0; i<newNearByPosts.length; i++ ) {
            let nowmemberId = [];
            for(let j=0; j<newNearByPosts[i].nowMember.length; j++){
                nowmemberId.push(newNearByPosts[i].nowMember[j])
            }
            nowmemberId2.push(nowmemberId)
        }

        var userInfo = '';
        var nowInfo = '';
        var nowMember = '';
        for(let i=0; i<nowmemberId2.length; i++) {
            userInfo = await User.findOne({
                userId: newNearByPosts[i].userId
            })
            newNearByPosts[i]['nowMember'] = [];
            for(let j=0; j<nowmemberId2[i].length; j++) {
                nowMember = await User.findOne({
                    userId: nowmemberId2[i][j]
                })
                nowInfo = {
                    memberId: nowMember.userId,
                    memberImg: nowMember.userImg,
                    memberNickname: nowMember.nickName,
                    memberAgee: nowMember.userAge,
                    memberGen: nowMember.userGender,
                    memberDesc: nowMember.userContent
                }
                newNearByPosts[i]['nowMember'].push(nowInfo);
            }
            newNearByPosts[i]['nickName'] = `${userInfo.nickName}`;
            newNearByPosts[i]['userAge'] = `${userInfo.userAge}`;
            newNearByPosts[i]['userGender'] = `${userInfo.userGender}`;
            newNearByPosts[i]['userImg'] = `${userInfo.userImg}`;
        }
        const nearPost = newNearByPosts
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);

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
        var nearPosts = await Post.find(
            { address },
        ).sort({ $natural: -1 });
        let userInfo = '';
        for(let i=0; i<nearPosts.length; i++) {
            userInfo = await User.findOne({
                userId: nearPosts[i].userId
            })
            nearPosts[i]['nickName'] = `${userInfo.nickName}`;
            nearPosts[i]['userAge'] = `${userInfo.userAge}`;
            nearPosts[i]['userGender'] = `${userInfo.userGender}`;
            nearPosts[i]['userImg'] = `${userInfo.userImg}`;
            nearPosts[i]['level'] =`${userInfo.level}`;
            let nowmemberId = [];
            let nowMember = '';
            for(let j=0; j<nearPosts[i].nowMember.length; j++){
                nowmemberId.push(nearPosts[i].nowMember[j]) 
            }
            nearPosts[i]['nowMember'] = [];
            for(let j=0; j<nowmemberId.length; j++) {
                nowMember = await User.findOne({
                    userId: nowmemberId[j]
                })
                nowInfo = {
                    memberId: nowMember.userId,
                    memberImg: nowMember.userImg,
                    memberNickname: nowMember.nickName,
                    memberAgee: nowMember.userAge,
                    memberGen: nowMember.userGender,
                    memberDesc: nowMember.userContent,
                    memberLevel: nowMember.level,
                    memberCategory: nowMember.userInterest
                }
                nearPosts[i]['nowMember'].push(nowInfo); 
            }
        }

        res.status(200).json({ nearPosts });
    } catch (err) {
        console.log(err);
        res.status(400).send('본인위치 근처 전체 포스트 오류');
    }
});

// 상세페이지 조회
router.get('/postDetail/:postId', authMiddleware, async (req, res) => {
    const { postId } = req.params;
    var newPost = await Post.findOne({ _id: postId });
    const userInfo = await User.findOne({
        userId: newPost.userId
    })
    newPost['nickName'] = `${userInfo.nickName}`;
    newPost['userAge'] = `${userInfo.userAge}`;
    newPost['userGender'] = `${userInfo.userGender}`;
    newPost['userImg'] = `${userInfo.userImg}`;

    let nowmemberId = [];
    let nowMember = '';
    for(let i=0; i<newPost.nowMember.length; i++){
        nowmemberId.push(newPost.nowMember[i])
    }
    newPost['nowMember'] = [];
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
            memberDesc: nowMember.userContent,
            memberLevel: nowMember.level,
            memberCategory: nowMember.userInterest
        }
        newPost['nowMember'].push(nowInfo); 
    }
    res.status(200).json({ newPost, msg: '성고옹' });
});

// 참여버튼
router.get('/postPush/:roomId', authMiddleware, async (req, res) => {
    const { roomId } = req.params;
    const { user } = res.locals;
    const { userId } = user;

    await Post.updateOne(
        { roomId: roomId },
        { $push: { nowMember: [userId] } }
    );
    await Room.updateOne(
        { roomId: roomId },
        { $push: { nowMember: [userId] } }
    )
    await Myex.create({
        userId,
        roomId
    });

    res.status(200).send({ msg: '성공' });    
});

// 참여 취소
router.get('/postPushCancle/:roomId', authMiddleware, async (req, res) => {
    const { roomId } = req.params;
    const { user } = res.locals;
    const { userId } = user;
    await Post.updateOne(
        { roomId },
        { $pullAll: { nowMember: [ [ userId ] ] } }
    )
    await Room.updateOne(
        { roomId },
        { $pullAll: { nowMember: [[ userId ]] } }
    )
    await Myex.deleteOne({
        userId,
        roomId
    })
    res.status(200).send({ msg: '취소완료!' });    
});

// 모집완료 
router.get('/complete/:postId', authMiddleware, async (req, res) => {
    const { postId } = req.params;
    await Post.updateOne(
        { _id: postId },
        { $set: { status: false } }
    )
    res.status(200).send({ msg: '모집완료!' });    
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
        var postList = await Post.create({
            userId: usersId,
            postTitle,
            postDesc,
            postCategory,
            datemate,
            maxMember,
            nowMember: [[usersId]],
            memberGender,
            address,
            spot,
            latitude,
            longitude,
            createdAt,
            memberAge,
            status,
            roomId,
            nickName: 'a',
            userAge: 'a',
            userGender: 'a',
            userImg: 'a',
            level: 'a'
        });
        await Room.create({
            roomId,
            postTitle,
            maxMember,
            owner: usersId,
            ownerImg: 'a',
            nowMember: [[usersId]],
            createdAt,
        });
        const userInfo = await User.findOne({
            userId: usersId
        });
        const nowInfo = {
            memberId: userInfo.userId,
            memberImg: userInfo.userImg,
            memberNickname: userInfo.nickName,
            memberAgee: userInfo.userAge,
            memberGen: userInfo.userGender,
            memberDesc: userInfo.userContent
        }
        postList['nickName'] = `${userInfo.nickName}`;
        postList['userAge'] = `${userInfo.userAge}`;
        postList['userGender'] = `${userInfo.userGender}`;
        postList['userImg'] = `${userInfo.userImg}`;
        postList['nowMember'].push(nowInfo);
        await Myex.create({
            userId: usersId,
            roomId
        });
        res.status(200).json({ postList });
    } catch (error) {
        console.log(error);

        res.status(400).send({ msg: '게시글이 작성되지 않았습니다.' });
    }
});

// 게시글 삭제
router.delete('/postDelete/:roomId', authMiddleware, async (req, res) => {
    const { roomId } = req.params;

    try {
        await Post.deleteOne({ roomId });
        await Room.deleteOne({ roomId });
        res.status(200).send({ result: 'success' });
    } catch (error) {
        console.error(error);
        res.status(400).send({ msg: '게시글이 삭제되지 않았습니다.' });
    }
});

module.exports = router;
