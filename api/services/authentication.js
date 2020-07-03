'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
const secret_key = '13795523445';

exports.createToken = function(user){
    let payload = {
        name: user.name,
        surname: user.surname,
        nickname: user.nickname,
        email: user.email,
        role: user.role,
        iat: moment().unix(),
        exp: moment().add(2, 'days').unix()
    }

    return jwt.encode(payload, secret_key);
}