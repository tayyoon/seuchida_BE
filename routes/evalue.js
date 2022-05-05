const express = require('express');
const router = express.Router();
const Post = require('../schemas/post');
const User = require('../schemas/user');
const Evalue = require('../schemas/evalue');

const passport = require('passport');
const jwt = require('jsonwebtoken');

const authMiddleware = require('../middlewares/auth-middleware');


const upload = require('../S3/s3');

router.post('/evalue', authMiddleware, async (req, res) => {
    const { data } = req.body;
    console.log(data);
    try {
        for (let i = 0; i < data.length; i++) {
            const newEvalue = data[i];
            console.log(newEvalue);
            const good = await Evalue.findOne({ userId: newEvalue.userId });
            console.log('newEvalue', newEvalue.cate);
            console.log('---이거---', good.userEvalue);

            if (newEvalue.cate === 'good1') {
                await Evalue.updateOne(
                    { userId: newEvalue.userId },
                    {
                        $set: {
                            userEvalue: { good1: good.userEvalue[0].good1 + 1 },
                        },
                    }
                );
            } else if (newEvalue.cate === 'good2') {
                await Evalue.updateOne(
                    { userId: newEvalue.userId },
                    {
                        $set: {
                            userEvalue: { good2: good.userEvalue[0].good2 + 1 },
                        },
                    }
                );
            } else if (newEvalue.cate === 'good3') {
                await Evalue.updateOne(
                    { userId: newEvalue.userId },
                    {
                        $set: {
                            userEvalue: { good3: good.userEvalue[0].good3 + 1 },
                        },
                    }
                );
            } else if (newEvalue.cate === 'bad1') {
                await Evalue.updateOne(
                    { userId: newEvalue.userId },
                    {
                        $set: {
                            userEvalue: { bad1: good.userEvalue[0].bad1 + 1 },
                        },
                    }
                );
            } else if (newEvalue.cate === 'bad2') {
                await Evalue.updateOne(
                    { userId: newEvalue.userId },
                    {
                        $set: {
                            userEvalue: { bad2: good.userEvalue[0].bad2 + 1 },
                        },
                    }
                );
            } else if (newEvalue.cate === 'bad3') {
                await Evalue.updateOne(
                    { userId: newEvalue.userId },
                    {
                        $set: {
                            userEvalue: { bad3: good.userEvalue[0].bad3 + 1 },
                        },
                    }
                );
            }
        }
        res.status(200).send('평가 성고옹');
    } catch (error) {
        console.error(error);
        res.status(401).send('평가가 뭔가 이상한데');
    }
    const { evalue } = req.body;
});

// 내가 내꺼 평가 보기
router.get('/evalue', authMiddleware, async (req, res) => {
    const { userId } = req.body;
});

// 내가 상대방 평가 보기 말풍선쓰
router.get('/evaluebulloon/:userId', authMiddleware, async (req, res) => {
    const { userId } = req.params;
    let result = await Evalue.findOne(
        { userId },
        { good1: 1, good2: 1, good3: 1, bad1: 1, bad2: 1, bad3: 1 }
    );
    console.log('결가과과과스', [result]);
    result = [result][0];
    console.log('asdfasdfasdfasf', result.length);

    for (let i = 1; i < result[0].length; i++) {
        console.log('ltltltltltltl', result[i]);
    }
});

// 내가 내꺼 평가 보기
router.get('/evaluegraph/:userID', authMiddleware, async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await Evalue.findOne({ userId }, {});
        res.status(200).send('옛다 그래프 값', result);
    } catch (error) {
        console.error(error);
        res.status(401).send('그래프 실패에~~ㅅ666666666666');
    }
});

module.exports = router;
