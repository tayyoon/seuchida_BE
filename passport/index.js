require("dotenv").config();
const google = require('./google');
const kakao = require('./kakao');
module.exports = () => {
    google();
    kakao();
};
