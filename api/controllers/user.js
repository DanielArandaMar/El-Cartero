'use strict'

const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/authentication');
const saveUserService = require('../services/saveUser');
const User = require('../models/user');
const Account = require('../models/account');
const Verification = require('../models/verification');
const verification = require('../models/verification');

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


            // Validar el formato del nombre de usuario
            const ValidateNicknameFormat = formatNickname(user.nickname);
            if(!ValidateNicknameFormat) return displayCustom(res, 400, 'Formato de nombre de usuario incorrecto');
            

            /* 
            *   Validar la escritura de la contraseña (formato)
            *   Encriptar la contraseña del usuario
            *   Validar si el 'nickname' se repite'
            *   Guardar el usuario en la base de datos
            */
            formatPassword(user.password, res, 7);
            getPasswordHash(user.password).then((value) => {
                user.password = value.hash;
                
                saveUserService.saveUserInDatabase(user).then((value) => {
                    if(value.user != null && value.account != null && value.verification != null){
                        return res.status(200).send({
                            user: value.user,
                            account: value.account,
                            verification: value.verification
                        });
                    } else {
                        return displayCustom(res, 400, 'El nombre de usuario ya esta en uso');
                    }
                   
                });
                
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

    },





    /** ACTUALIZAR INFORMACION DEL USUARIO */
    updateUserGeneralData: function(req, res){
        let userId = req.user.sub;
        let update = req.body;
        /*
        *   Excluir la información que no se actualizará
        */
        delete update.password;
        delete update.email;
        delete update.nickname;

        User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated) => {
            if(err) return display500Error(res);
            if(!userUpdated) return display400Error(res);
            userUpdated.password = undefined;
            userUpdated.email = undefined;
            userUpdated.role = undefined;
            return res.status(200).send({ user: userUpdated });
        });
    },





    /** ACTUALIZAR NOMBRE DE USUARIO */
    updateUserNickname: function(req, res){
        const userId = req.user.sub;
        const nickname = req.body.nickname;
        const pipe = { $and: [{nickname: nickname}, {_id: {$ne: userId}}]};

        if(nickname == null) return displayCustom(res, 400, 'Inserta tu nuevo nombre de usuario.');

        // Validar el formato de nombre de usuario
        const ValidateNicknameFormat = formatNickname(nickname);
        if(!ValidateNicknameFormat) return displayCustom(res, 400, 'Formato de nombre de usuario incorrecto.');

        User.find(pipe, (err, users) => {
            if(err) return display500Error(res);
            console.log(users.length);
            /*
            * COINCIDENCIA users.length > 0    NO HAY COINCIDENCIA users.length <= 0
            */
            if(users.length > 0) return displayCustom(res, 400, 'Nombre de usuario ya en uso.');
            // Actualizar el nombre de usuario
            User.findByIdAndUpdate(userId, {nickname: nickname}, {new: true}, (err, userUpdated) => {
                if(err) return display500Error(res);
                if(!userUpdated) return display400Error(res);
                userUpdated.password = undefined;
                userUpdated.email = undefined;
                userUpdated.role = undefined;
                return res.status(200).send({ user:userUpdated });
            });
        });

    },





    /** ACTUALIZAR CONTRASEÑA **/
    updateUserPassword: function(req, res){
        const userId = req.user.sub;
        const oldPassword = req.body.oldPassword;
        var newPassword = req.body.newPassword;

        if(newPassword == null && oldPassword == null) return displayCustom(res, 400, 'Inserta los campos correspondientes.');

        // Validar el formato de la contraseña
        formatPassword(newPassword, res, 7);

        User.findById(userId, (err, user) => {
            if(err) return display500Error(res);
            if(!user) return display400Error(res);
            bcrypt.compare(oldPassword, user.password, (err, check) => {
                if(check){
                    // Actualizar la contraseña
                    getPasswordHash(newPassword).then((value) => {
                        newPassword = value.hash;
                        User.findByIdAndUpdate(userId, {password: newPassword}, {new: true}, (err, userUpdated) => {
                            if(err) return display500Error(res);
                            if(!userUpdated) return display400Error(res);
                            return res.status(200).send({ user: userUpdated });
                        });
                    });
                    
                } else {
                    return displayCustom(res, 400, 'Contraseña incorrecta');
                }
            });
        });
    },


    

    /** ACTUALIZAR EL CORREO ELECTRONICO */
    updateEmail: function(req, res){
        const userId = req.user.sub;
        const newCode = getVerificationCode();
        Account.findOne({ user: userId }, (err, account) =>{
            if(err) return display500Error(res);
            if(!account) return display400Error(res);

            const accountId = account._id;
            Verification.findOneAndUpdate({account: accountId}, {code: newCode}, {new: true}, (err, verificationUpdated) => {
                if(err) return display500Error(res);
                if(!verificationUpdated) return display400Error(res);
                return res.status(200).send({
                    message: 'Se ha enviado el nuevo código de verificación al nuevo correo'
                });
            });
        });
    }





};








/**** ****  FUNCIONALIDADES DE APOYO **** ****/



/*
*
* Funciones para el registro del usuario
*
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
    /*
    * FALSE -> FORMATO INCORRECTO   TRUE -> FORMATO CORRECTO
    */
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


function getVerificationCode(){
    let min = 10000;
	let max = 90000;
	return Math.round(Math.random() * (max-min) + min);
}




/*
*
* Funciones para mostrar mensajes de códigos de error http
*
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
*
* Funciones para verificar cadenas de texto
*
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