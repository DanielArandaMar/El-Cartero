'use strict'
const moment = require('moment');
const HttpResponses = require('../services/httpResponses');
const Blocked = require('../models/blocked');
const controller = {
    


    /* AÑADIR UN USUARIO A LA LISTA DE BLOQUEADOS */
    save: function(req, res){
        const params = req.body;
        const userId = req.user.sub;
        if(
            params.user_blocked != null && 
            params.reason &&
            params.created_at != null
        ){
            const blocked = new Blocked;
            blocked.user = userId;
            blocked.user_blocked = params.user_blocked;
            blocked.reason = params.reason;
            blocked.created_at = moment().unix();

            // Guardamos en la base de datos
            blocked.save((err, blockedSave) => {
                if(err) return HttpResponses.display500Error(res);
                if(!blockedSave) return HttpResponses.display400Error(res);
                return res.status(200).send({ blocked: blockedSave });
            });
        } else {
            return HttpResponses.displayCustom(res, 400, 'Faltan datos.');
        }
    },
    



    /* DESBLOQUEAR UN USUARIO EN CONCRETO */
    delete: function(req, res){
        const userId = req.user.sub;
        const blockedUser = req.params.blocked;
        // Buscar si esta agregado en usuarios bloqueado y que pertenece al usuario identificado
        const pipe = {$and: [{user: userId}, {user_blocked: blockedUser}]};
        Blocked.findOneAndDelete(pipe, (err, blockedDeleted) => {
            if(err) return HttpResponses.display500Error(res);
            if(!blockedDeleted) return HttpResponses.display400Error(res);
            
            return res.status(200).send({ blocked: blockedDeleted });
        });
    }


};
module.exports = controller;