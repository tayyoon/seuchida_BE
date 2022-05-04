const mongoose = require('mongoose');

const EvalueSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    // evlaue: {
    //     type: [
    //         {
    //             good1: {
    //                 type: Number,
    //                 default: 0,
    //             },
    //         },
    //         {
    //             good2: {
    //                 type: Number,
    //                 default: 0,
    //             },
    //         },
    //         {
    //             good3: {
    //                 type: Number,
    //                 default: 0,
    //             },
    //         },
    //         {
    //             bad1: {
    //                 type: Number,
    //                 default: 0,
    //             },
    //         },
    //         {
    //             bad2: {
    //                 type: Number,
    //                 default: 0,
    //             },
    //         },
    //         {
    //             bad3: {
    //                 type: Number,
    //                 default: 0,
    //             },
    //         },
    //     ],
    // },
    good1: {
        type: Number,
        default: 0,
    },
    good2: {
        type: Number,
        default: 0,
    },
    good3: {
        type: Number,
        default: 0,
    },
    bad1: {
        type: Number,
        default: 0,
    },
    bad2: {
        type: Number,
        default: 0,
    },
    bad3: {
        type: Number,
        default: 0,
    },
});

// ReviewSchema.virtual('ReviewId').get(function () {
//     return this._id.toHexString();
// });

EvalueSchema.set('toJSON', {
    virtuals: true,
});

module.exports = mongoose.model('Evalue', EvalueSchema);
