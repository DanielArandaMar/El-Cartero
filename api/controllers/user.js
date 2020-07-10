'use strict'

const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/authentication');
const moment = require('moment');
const fs = require('fs');
const path = require('path');

const saveUserService = require('../services/saveUser');
const HttpResponses = require('../services/httpResponses');
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


            // Validar el formato del nombre de usuario
            const ValidateNicknameFormat = formatNickname(user.nickname);
            if(!ValidateNicknameFormat) return HttpResponses.displayCustom(res, 400, 'Formato de nombre de usuario incorrecto.');
            

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
                        return HttpResponses.displayCustom(res, 400, 'El nombre de usuario ya esta en uso.');
                    }
                   
                });
                
            });

            
        } else {
            return HttpResponses.displayCustom(res, 400, 'Por favor ingresa los campos correspondientes.');
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
            if(err) return HttpResponses.display500Error(res);
            if(!user) return HttpResponses.displayCustom(res, 400, 'Credenciales incorrectas');
            
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
                    return HttpResponses.displayCustom(res, 400, 'Credenciales incorrectas');
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
            if(err) return HttpResponses.display500Error(res);
            if(!userUpdated) return HttpResponses.display400Error(res);
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

        if(nickname == null) return HttpResponses.displayCustom(res, 400, 'Inserta tu nuevo nombre de usuario.');

        // Validar el formato de nombre de usuario
        const ValidateNicknameFormat = formatNickname(nickname);
        if(!ValidateNicknameFormat) return HttpResponses.displayCustom(res, 400, 'Formato de nombre de usuario incorrecto.');

        User.find(pipe, (err, users) => {
            if(err) return HttpResponses.display500Error(res);
            /*
            * COINCIDENCIA users.length > 0    NO HAY COINCIDENCIA users.length <= 0
            */
            if(users.length > 0) return HttpResponses.displayCustom(res, 400, 'Nombre de usuario ya en uso.');
            // Actualizar el nombre de usuario
            User.findByIdAndUpdate(userId, {nickname: nickname}, {new: true}, (err, userUpdated) => {
                if(err) return HttpResponses.display500Error(res);
                if(!userUpdated) return HttpResponses.display400Error(res);
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

        if(newPassword == null && oldPassword == null) return HttpResponses.displayCustom(res, 400, 'Inserta los campos correspondientes.');

        // Validar el formato de la contraseña
        formatPassword(newPassword, res, 7);

        User.findById(userId, (err, user) => {
            if(err) return HttpResponses.display500Error(res);
            if(!user) return HttpResponses.display400Error(res);
            bcrypt.compare(oldPassword, user.password, (err, check) => {
                if(check){
                    // Actualizar la contraseña
                    getPasswordHash(newPassword).then((value) => {
                        newPassword = value.hash;
                        User.findByIdAndUpdate(userId, {password: newPassword}, {new: true}, (err, userUpdated) => {
                            if(err) return HttpResponses.display500Error(res);
                            if(!userUpdated) return HttpResponses.display400Error(res);
                            return res.status(200).send({ user: userUpdated });
                        });
                    });
                    
                } else {
                    return HttpResponses.displayCustom(res, 400, 'Contraseña incorrecta');
                }
            });
        });
    },



    

    /** ACTUALIZAR EL CORREO ELECTRONICO */
    updateEmail: function(req, res){
        const userId = req.user.sub;
        const newCode = getVerificationCode();
        const newEmail = req.body.email;
        // Comprobar que haya ingresado el nuevo correo electrónico
        if(newEmail == null) return HttpResponses.displayCustom(res, 400, 'Ingresa el nuevo correo electrónico.');

        Account.findOne({ user: userId }, (err, account) =>{
            if(err) return HttpResponses.display500Error(res);
            if(!account) return HttpResponses.display400Error(res);
            const accountId = account._id;

            // Crear nuevo documento de verificación 
            const verification = new Verification();
            verification.account = accountId;
            verification.code = newCode;
            verification.created_at = moment().add(1, 'days').unix(); 

            verification.save((err, verificationStored) => {
                if(err) return HttpResponses.display500Error(res);
                if(!verificationStored) return HttpResponses.display400Error(res);
                return res.status(200).send({
                    message: 'Se ha enviado el nuevo código de verificación a ' + newEmail
                });
            });
        });
    },


    /** SUBIR LA IMAGEN DE PERFIL DEL USUARIO **/
    uploadImage: function(req, res){
        const userId = req.user.sub;
        if(req.files){
            // Encontrar el nombre de la imagen
            let file_path = req.files.imageUser.path;
            let split_path = file_path.split("\\");
            let file_name = split_path[2];

            let ext_split = file_path.split('\.');
            let file_ext = ext_split[1];

            if(file_ext == 'jpg' || file_ext == 'png' || file_ext == 'gif' || file_ext == 'jpeg'){
                // actualizar imagen del usuario
                User.findByIdAndUpdate(userId, {image: file_name}, {new: true}, (err, userUpdated) => {
                    if(err) return HttpResponses.display500Error(res);
                    if(!userUpdated) return HttpResponses.display400Error(res);
                    userUpdated.password = undefined;
                    return res.status(200).send({ user: userUpdated });
                });
            } else {{
                removeImageUpload(file_path, res, 'Extensión de la imagen no válida.');
            }}

        } else {
            return displayCustom(res, 400, 'No has seleccionado una imagen.')
        }
    }


};





/**** ****  FUNCIONALIDADES DE APOYO **** ****/



/*
*
* Función para eliminar una imagen de la carpeta uploads
*
*/
function removeImageUpload(path, res, msg){
    fs.unlink(path, (err) => {
        return HttpResponses.displayCustom(res, 400, msg);
    });
}



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
    if(password.length < len) return HttpResponses.displayCustom(res, 400, 'La contraseña debe tener minimo '+len+' caracteres.');
    if(!haveCapitalizeLetter(password)) return HttpResponses.displayCustom(res, 400, 'La contraseña debe tener al menos una mayuscula.');
    if(!haveNumber(password)) return HttpResponses.displayCustom(res, 400, 'La contraseña debe tener números.');
    if(!haveNoCapitalizeLetter(password)) return HttpResponses.displayCustom(res, 400, 'La contraseña no tiene minusculas.');
}


function getVerificationCode(){
    let min = 10000;
	let max = 90000;
	return Math.round(Math.random() * (max-min) + min);
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