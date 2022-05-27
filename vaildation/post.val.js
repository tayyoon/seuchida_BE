const Joi = require('joi')
const post_validation = {
    post_wirte: async (req, res, next) => {
        console.log('req :', req.body)
        const body = req.body
        const schema = Joi.object().keys({
            postTitle: Joi.string()
                .pattern(new RegExp('^[!?~.^ㄱ-ㅎ|가-힣|a-z|A-Z|0-9 ]{1,15}$'))
                .required(),
            postDesc: Joi.string()
                .pattern(new RegExp('^[!?~.^ㄱ-ㅎ|가-힣|a-z|A-Z|0-9 ]{1,200}$'))
                .required(),
            postCategory: Joi.string().min(1).required(),
            datemate: Joi.string().min(1).required(),
            maxMember: Joi.number().required(),
            memberGender: Joi.string().min(1).required(),
            address: Joi.string().min(1).required(),
            spot: Joi.string().min(1).required(),
            latitude: Joi.number().required(),
            longitude: Joi.number().required(),
            memberAge: Joi.string().required(),
            status: Joi.boolean().required(),
        })

        try {
            // 검사시작
            await schema.validateAsync(body)
        } catch (e) {
            // 유효성 검사 에러
            console.log(e)
            return res.status(400).json({
                message: '게시글작성이 잘못되었습니다! 확인해주세요!',
            })
        }
        next()
    },
}

module.exports = post_validation
