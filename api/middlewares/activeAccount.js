'use strict'
const HttpResponses = require('../services/httpResponses');
const Account = require('../models/account');
/*
*   Verifica que la cuenta esté en modo activada
*/

exports.verifyActiveAcc = function(req, res, next){
    const userId = req.user.sub;
    Account.findOne({user: userId}, (err, account) => {
       if(err) return HttpResponses.display500Error(res);
       if(!account) return HttpResponses.display400Error(res);

       // comprobar que este activa la cuenta
        if(account.active != true) return HttpResponses.displayCustom(res, 400, 'Tu cuenta aún no ha sido verificada. Por favor verifica tu correo electrónico.');
        next();

    });
}
