'use strict'

const moment = require('moment');
const HttpResponses = require('../services/httpResponses');
const Account = require('../models/account');
const Verification = require('../models/verification');

exports.verify = function(req, res, next){

    const userId = req.user.sub;
    Account.findOne({ user: userId }, (err, account) => {
        Verification.findOne({ account: account._id }, (err, verification) => {
            if(err) return HttpResponses.display500Error(res);
            if(verification.created_at <= moment().unix()){
                // Código expirado
            } 
        });
    });

}