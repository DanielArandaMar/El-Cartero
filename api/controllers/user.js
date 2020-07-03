'use strict'

const User = require('../models/user');
const bcrypt = require('bcrypt-nodejs');


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
            if(!FormatNickname) displayCustom(res, 400, 'Formato de nombre de usuario incorrecto.');

            
            // Comprobación del nombre de usuario
            let ValidUsername = verifyNicknameRepeat(user.nickname).then((value)=>{
                return value.result;
            });
            if(!ValidUsername) displayCustom(res, 400, 'Nombre de usuario ya en uso.');


            // Encriptar la contraseña
            formatPassword(user.password, res, 7);
            let hash = getPasswordHash(user.password).then((value) => {
                console.log(value.hash);
                return value.hash;
            });
            // user.password = hash;
            // console.log(user.password);

            // Enviar el código de comprobación al correo 

            console.log(user);
            // Guardar en la base de datos
            user.save((err, userStored) => {
                if(err) return display500Error(res);
                if(!userStored) return display400Error(res);

                return res.status(200).send({ user: userStored });
            });

            
        } else {
            return displayCustom(res, 400, 'Por favor ingresa los campos correspondientes.');
        }
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



/*
* Funciones para mostrar mensajes de códigos de error
*/
function display500Error(res){
    let message = 'Error en el servidor. Vuelve a intentarlo más tarde.';
    return res.status(500).send({message});
}

function display404Error(res){
    let message = 'No se ha podido encontrar el contenido solicitado.';
    return res.status(404).send({message});
}

function display400Error(res){
    let message = 'No se ha podido interpretar la solicitud.';
    return res.status(400).send({message});
}

function displayCustom(res, status, message){
    return res.status(status).send({message});
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