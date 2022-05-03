// // 참여버튼
// router.post('postPush/:postId', authMiddleware, async (req, res) => {
//     const { user } = res.locals;
//     const { userId, userImg } = user;
//     const NMember = await Join.create({
//         postId,
//         userId,
//         userImg,
//     });
// });

// 게시글 검색 - 정규표현식 객체 생성자 const a = new RegExp('찾는 내용')
// content 자리에는 검색어가 들어가야 함

// router.get('/postFind', authMiddleware, async (req, res) => {
//     let options = [];
//     if (req.query.option == 'title') {
//         options = [{ title: new RegExp(req.query.content) }];
//     } else if (req.query.option == 'content') {
//         options = [{ postDesc: new RegExp(req.query.content) }];
//     } else if (req.query.option == 'title+content') {
//         options = [
//             { title: new RegExp(req.query.content) },
//             { postDesc: new RegExp(req.query.content) },
//         ];
//     } else {
//         const err = new Error('검색 옵션이 없습니다.');
//         err.status = 400;
//         throw err;
//     }
//     const posts = await Post.find({ $or: options });
// });

// // 최근검색어
// router.get('/findHistory', authMiddleware, async (req, res, next) => {
//     try {
//         const histories = await History.find(
//             {},
//             { limit: 5, sort: '-createdAt' }
//         );
//     } catch (error) {
//         console.error(error);
//         next(error);
//     }
// });
