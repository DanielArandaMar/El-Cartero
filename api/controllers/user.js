'use strict'

const bcrypt = require('bcrypt-nodejs');
const moment = require('moment');
const jwt = require('../services/authentication');
const User = require('../models/user');
const Account = require('../models/account');
const Verification = require('../models/verification');


const controller = {

    /** GURDAR UN NUEVO USUARIO */
    register: function(req, res){
        let user = new User();
        let params = req.body;
        if(
            params.name != null &&
            params.surname != null &&
            params.nickname != null &&
            params.email != null &&
            params.password != null
        ){

            user.name = params.name;
            user.surname = params.surname;
            user.nickname = params.nickname;
            user.email = params.email;
            user.password = params.password;
            // Campos por defecto
            user.role = 'ROLE_USER';

            // Validar el formato de nombre de usuario
            let FormatNickname = formatNickname(user.nickname);
            if(!FormatNickname) return displayCustom(res, 400, 'Formato de nombre de usuario incorrecto.');

            
            // Comprobación del nombre de usuario
            let VerifyNickname = verifyNicknameRepeat(user.nickname).then((value)=>{
                return value.result
            });
            if(!VerifyNickname) return displayCustom(res, 400, 'Nombre de usuario ya en uso.');
           

            // Encriptar la contraseña y guardar al usuario
            formatPassword(user.password, res, 7);
            getPasswordHash(user.password).then((value) => {
                user.password = value.hash;
                
                // Guardar al usuario
                saveUserInDatabase(user);
                
            });
            
        } else {
            return displayCustom(res, 400, 'Por favor ingresa los campos correspondientes.');
        }
    },


    

    /** AUTENTICACIÓN EN LA APLICACIÓN */
    login: function(req, res){
        let params = req.body;

        /*
        * Parametros a obtener
        * extraInfo -> Nombre de usuario o correo eletrónico
        */
        var password = params.password;
        var extraInfo = params.nickname; 

        const pipe = {$or: [{nickname: extraInfo}, {email: extraInfo}]};

        User.findOne(pipe, (err, user) => {
            if(err) return ndisplay500Error(res);
            if(!user) return displayCustom(res, 400, 'Credenciales incorrectas');
            
            bcrypt.compare(password, user.password, (err, check) => {
                if(check){
                    /* CONTRASEÑA CORRECTA ! */
                    if(params.getToken){
                        return res.status(200).send({ token: jwt.createToken(user) });
                    } else {
                        
                        return res.status(200).send({ user });
                    }
                } else {
                    /* CONTRASEÑA INCORRECTA ! */
                    return displayCustom(res, 400, 'Credenciales incorrectas');
                }
            });
        });

    }

};








/**** ****  FUNCIONALIDADES DE APOYO **** ****/



/*
* Funciones para el registro del usuario
*/
async function getPasswordHash(password){
    let hash = await new Promise(function(resolve, reject){
        bcrypt.hash(password, null, null, (err, hash) => {
            if(err) reject(err);
            resolve(hash);
        });
    });
    return {
        hash
    };

}

function formatNickname(nickname){
    var username = nickname.toLowerCase();
    var correctNickname = true;
    for(var i = 0; i<username.length; i++){
        if(username.charAt(i) == " "){
            correctNickname = false;
        }
    }
    if(username.length < 6) correctNickname = false;
    return correctNickname;
}

function formatPassword(password, res, len){
    if(password.length < len) return displayCustom(res, 400, 'La contraseña debe tener minimo '+len+' caracteres.');
    if(!haveCapitalizeLetter(password)) return displayCustom(res, 400, 'La contraseña debe tener al menos una mayuscula.');
    if(!haveNumber(password)) return displayCustom(res, 400, 'La contraseña debe tener números.');
    if(!haveNoCapitalizeLetter(password)) return displayCustom(res, 400, 'La contraseña no tiene minusculas.');
}

async function verifyNicknameRepeat(nickname){
    let result = await User.find({ nickname: nickname }).exec().then((users) => {
        if(users.length == 0) return true;
        if(users.length >= 1) return false;
    }).catch((err) => {
        return handleError(err);
    });
    /*
    * True -> Usuario correcto --  False -> Usuario ya en uso
    */
    return { result };
}

async function saveUserInDatabase(user){

    // Guardar el 'usuario'
    const userRegister = await new Promise(function(resolve, reject){
        user.save((err, userStored) => {
            if(err) reject(err);
            resolve(userStored);
        });
    });


    // Guardar el 'usuario' en 'cuentas'
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


    // Guardar el usuario en 'cuentas' en verificación
    const verification = new Verification();
    verification.account = saveAcc._id;
    verification.code = null;
    verification.created_at = moment().unix();
    const saveVerification = await new Promise(function(resolve, reject){
        verification.save((err, verificationStored) => {
            
        });
    });

    return {
        user: userRegister,
        account: save
    }
}



/*
* Funciones para mostrar mensajes de códigos de error
*/
function display500Error(res){
    res.status(500).send({message: 'Error en el servidor. Vuelve a intentarlo más tarde.'});
}

function display404Error(res){
    res.status(404).send({message: 'No se ha podido encontrar el contenido solicitado.'});
}

function display400Error(res){
    res.status(400).send({message: 'No se ha podido interpretar la solicitud.'});
}

function displayCustom(res, status, message){
    res.status(status).send({message});
}



/*
* Funciones para verificar strings
*/
function haveCapitalizeLetter(text){
    var result = false;
    for(var i = 0; i<text.length; i++){
       if(text.charCodeAt(i) >= 65 && text.charCodeAt(i) <= 90){
            result = true;
       }
    }
    return result;
}

function haveNoCapitalizeLetter(text){
    var result = false;
    for(var i = 0; i<text.length; i++){
       if(text.charCodeAt(i) >= 97 && text.charCodeAt(i) <= 122){
            result = true;
       }
    }
    return result;
}

function haveNumber(text){
    var result = false;
    for(var i = 0; i<text.length; i++){
       if(text.charCodeAt(i) >= 48 && text.charCodeAt(i) <= 57){
            result = true;
       }
    }
    return result;
}





module.exports = controller;