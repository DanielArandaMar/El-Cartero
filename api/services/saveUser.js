'use strict'

const moment = require('moment');
const User = require('../models/user');
const Account = require('../models/account');
const Verification = require('../models/verification');

/*
* Funcionalidad: Guardar un nuevo usuario en el sistema de base de datos.
* Valida que el nombre de usuario no este repetido, guarda en la colección de usuarios, colección de cuentas (accounts) 
* y colección de verificación (Verification)
*
*/

exports.saveUserInDatabase = async function(user) {

    /*
    *  Encontrar usuiarios con 'nickname' similares
    *  True-> REPETIDO     False-> NO REPETIDO
    */
   const repetedNickname = await User.find({ nickname: user.nickname }).exec().then((users) => {
        if(users.length == 0) return false;
        if(users.length >= 1) return true;
    }).catch((err) => {
        return handleError(err);
    });

if(!repetedNickname){


    // Guardar el 'usuario'
    const userRegister = await new Promise(function(resolve, reject){
        user.save((err, userStored) => {
            if(err) reject(err);
            resolve(userStored);
        });
    });


    // Guardar el 'usuario' en 'cuentas (accounts)'
    const account = new Account();
    account.user = user._id;
    account.active = false;
    account.recovery_mail = null;
    account.created_at = moment().unix();

    const saveAcc = await new Promise(function(resolve, reject){
        account.save((err, account) => {
            if(err) reject(err);
            resolve(account);
        });
    });


    // Guardar el usuario en 'cuentas' en verificación (verification)
    const verification = new Verification();
    verification.account = saveAcc._id;
    verification.code = getVerificationCode(); // Generar y asignar código de verificación
    verification.new_email = null; // null -> no queremos actualizar un mail nuevo
    verification.created_at = moment().add(2, 'days').unix(); // Agregamos dos dias para que expire

    const saveVerification = await new Promise(function(resolve, reject){
        verification.save((err, verificationStored) => {
            if(err) reject(err);
            resolve(verificationStored);
        });
    });


    return {
        user: userRegister,
        account: saveAcc,
        verification: saveVerification
    }

} else {
    return {
        user: null,
        account: null,
        verification: null
    }
}
} 


/* Obetner el codigo de verificacónh */
function getVerificationCode(){
    let min = 10000;
	let max = 90000;
	return Math.round(Math.random() * (max-min) + min);
}
