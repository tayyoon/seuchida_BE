const mongoose = require('mongoose');

const EvalueSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        userEvalue: [
            { good1: { type: Number, default: Number(0), required: true } },
            { good2: { type: Number, default: Number(0), required: true } },
            { good3: { type: Number, default: Number(0), required: true } },
            { bad1: { type: Number, default: Number(0), required: true } },
            { bad2: { type: Number, default: Number(0), required: true } },
            { bad3: { type: Number, default: Number(0), required: true } },
        ],
    }
    // good1: {
    //     type: Number,
    //     default: 0,
    // },
    // good2: {
    //     type: Number,
    //     default: 0,
    // },
    // good3: {
    //     type: Number,
    //     default: 0,
    // },
    // bad1: {
    //     type: Number,
    //     default: 0,
    // },
    // bad2: {
    //     type: Number,
    //     default: 0,
    // },
    // bad3: {
    //     type: Number,
    //     default: 0,
    // },
);

// ReviewSchema.virtual('ReviewId').get(function () {
//     return this._id.toHexString();
// });

EvalueSchema.set('toJSON', {
    virtuals: true,
});

module.exports = mongoose.model('Evalue', EvalueSchema);

// [
//     "userId":"userId",
//     "userEvalue": [
//         {"good1":1},
//         {"good1":1},
//         {"good1":1},
//         {"good1":1},

//     ]

//     userEvalu: {
//         type:[
//             good:{
//                 type:
//             }
//         ]
//     }
// ]
