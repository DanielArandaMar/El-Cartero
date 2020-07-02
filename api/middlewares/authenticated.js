'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
const secret_key = 13795523445;

exports.auth = function(req, res, next){
    if(!req.headers.authorization) return res.status(403).send({message: 'No te haz autenticado'});
    let token = req.headers.authorization.replace(/['"]+/g, '');
    try{
        var payload = jwt.decode(token, secret_key);
        if(payload.exp <= moment().unix()) return res.status(400).send({message: 'Sesión ya expirada'});
    }catch(ex){
        return res.status(400).send({message: 'Token de autenticación no válida'});
    }
    req.user = payload;
    next();
}