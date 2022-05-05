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
    const { evalue } = req.body;
    for (let i = 0; i < evalue.length; i++) {
        const newEvalue = evalue[i];
        console.log(newEvalue);
        await Evalue.create({
            userId: newEvalue.userId,
        });
        const good = await Evalue.findOne(
            { userId: newEvalue.userId },
            { good1: 1 }
        );
        console.log(good);
        if (newEvalue.cate == 'good1') {
            await Evalue.updateOne(
                { userId: newEvalue.userId },
                { $set: { good1: good.good1 + 1 } }
            );
        } else if (newEvalue.cate === 'good2') {
            await Evalue.updateOne(
                { userId: newEvalue.userId },
                { $set: { good2: good.good2 + 1 } }
            );
        } else if (newEvalue.cate === 'good3') {
            await Evalue.updateOne(
                { userId: newEvalue.userId },
                { $set: { good3: good.good3 + 1 } }
            );
        } else if (newEvalue.cate === 'bad1') {
            await Evalue.updateOne(
                { userId: newEvalue.userId },
                { $set: { bad1: good.bad1 + 1 } }
            );
        } else if (newEvalue.cate === 'bad2') {
            await Evalue.updateOne(
                { userId: newEvalue.userId },
                { $set: { bad2: good.bad2 + 1 } }
            );
        } else if (newEvalue.cate === 'bad3') {
            await Evalue.updateOne(
                { userId: newEvalue.userId },
                { $set: { abd3: good.bad3 + 1 } }
            );
        }
        // switch (newEvalue.cate) {
        //     case 'good1':
        //         await Evalue.updateOne(
        //             { userId: newEvalue.userId },
        //             { $set: { good1: good + 1 } }
        //         );
        //         break;
        //     case good2:
        //         await Evalue.updateOne(
        //             { userId: newEvalue.userId },
        //             { $set: { good1: good2 + 1 } }
        //         );
        //     case good3:
        //         await Evalue.updateOne(
        //             { userId: newEvalue.userId },
        //             { $set: { good1: good3 + 1 } }
        //         );
        //     case bad1:
        //         await Evalue.updateOne(
        //             { userId: newEvalue.userId },
        //             { $set: { good1: bad1 + 1 } }
        //         );
        //     case bad2:
        //         await Evalue.updateOne(
        //             { userId: newEvalue.userId },
        //             { $set: { good1: bad2 + 1 } }
        //         );
        //     case bad3:
        //         await Evalue.updateOne(
        //             { userId: newEvalue.userId },
        //             { $set: { good1: bad3 + 1 } }
        //         );
        //     default:
        //         console.log('Not matched.');
        // }

        await Evalue.create({
            userId: newEvalue.userId,
        });
        await Evalue.updateOne({ userId: newEvalue.userId }, { $set: {} });
    }
    console.log(evalue);
    res.status(200).send('성고옹');
});

module.exports = router;
