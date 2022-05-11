require("dotenv").config();
const jwt = require('jsonwebtoken');
const User = require('../schemas/user');
const Joi = require("joi")

const authorizationSchema = Joi.string()

module.exports = async (socket, next) => {
    try {
        const Authorization = await authorizationSchema.validateAsync(
            socket.handshake.auth.auth)
        const {userId} = jwt.verify(Authorization, process.env.MY_KEY);
        await User.findOne({ userId })
            .exec()
            .then((user) => {
                socket.user = {
                    userId: user.userId,
                    nickName: user.nickName,
                }
            })
        next()
    } catch (error) {
        console.error(`Socket Error ${socket.handshake.headers.referer} : ${error.message}`);
        // TODO 클라이언트에게 연결이 실패했다는 것을 알려주는 기능 구현
        next(new Error(error.message))
    }
}