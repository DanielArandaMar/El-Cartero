'use strict'

const moment = require('moment');
const HttpResponses = require('../services/httpResponses');
const Account = require('../models/account');
const Verification = require('../models/verification');

exports.verify = function(req, res, next){

    const userId = req.user.sub; // id del usuario identificado
    Account.findOne({ user: userId }, (err, account) => {
        Verification.findOne({ account: account._id }, (err, verification) => {
            if(err) return HttpResponses.display500Error(res);
   			if(!verification) return HttpResponses.display400Error(res);
            if(verification.created_at <= moment().unix()){
                // Código de verificación expirado
            	Verification.find({ _id: verification._id }).remove((err, deleted) => {
                    if(err) return HttpResponses.display500Error(res);
                    if(!deleted) return HttpResponses.display400Error(res);
                    return res.status(200).send({ message: 'Tu código de verificación ha expirado' });
            	});
            } else {
                next();
            } 
        });
    });

}