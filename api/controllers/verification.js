'use strict'
const HttpResponses = require('../services/httpResponses');
const Verification = require('../models/verification');
const Account = require('../models/account');

const controller = {

    /** DEJAR EN NULO EL CODIGO DE VERIFICACIÓN */
    deleteVerification: function(req,res){
        const accountId = req.params.accountId;
        const userId = req.user.sub;

        // Comprobar que sea el mismo usuario identificado
        Account.findOne({ user: userId }, (err, account) => {
            if(account._id != accountId) return HttpResponses.display403Error(res);

            Verification.findOneAndDelete({ account: accountId }, (err, verifDeleted) => {
                if(err) return HttpResponses.display500Error(res);
                if(!verifDeleted) return HttpResponses.display400Error(res);
                return res.status(200).send({ verification: verifDeleted});
            });
        });
    }
}

module.exports = controller;
