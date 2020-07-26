const moment = require('moment');
const paginate = require('mongoose-pagination');
const path = require('path');
const fs = require('fs');
const Mail = require('../models/mail.js');
const HttpResponses = require('../services/httpResponses');

const controller = {

  // ENVIAR UN CORREO
  sendMail: function(req, res){
    const params = req.body;

    if(
      params.to != null &&
      params.content != null &&
      params.anonymouse != null
    ){

      const mail = new Mail();

      mail.from = req.user.sub;
      mail.to = params.to;
      mail.content = params.content;
      mail.anonymouse = params.anonymouse;
      mail.image = null;
      mail.deleted_from = false;
      mail.deleted_to = false;
      mail.created_at = moment().unix();

      // gurdar el registro
      mail.save((err, mailStored) => {
          if(err) return HttpResponses.display500Error(res);
          if(!mailStored) return HttpResponses.display400Error(res);

          return res.status(200).send({ mail: mailStored });
      });

    } else {
      return HttpResponses.displayCustom(res, 400, 'Ingresa los datos necesarios para enviar un correo.');
    }
  },


  // ENVIAR UN ARCHIVO ADJUNTO EN EL CORREO
  uploadImage: function(req, res){
      const id = req.params.id;
      const userId = req.user.sub;
      if(req.files){
        let file_path = req.files.mailImage.path;
        let file_split = file_path.split('\\');
        let file_name = file_split[2];

        let ext_split = file_path.split('\.');
        let file_ext = ext_split[1];

        if(file_ext == 'jpg' || file_ext == 'png' || file_ext == 'gif' || file_ext == 'jpeg'){
          const pipe = { $and: [ {_id: id}, {from: userId} ] };
          Mail.update(pipe, {image: file_name}, {new: true}, (err, mailUpdated) => {
            if(err) removeUploadImage(file_path, 'Error en el servidor. Vuelve a intentarlo más tarde.', res, 500);
            if(!mailUpdated) removeUploadImage(file_path, 'Algo salió mal. No se ha podido enviar tu imagen.', res, 400);

            return res.status(200).send({ mail: mailUpdated });
          });

        } else {
          removeUploadImage(file_path, 'Extensión de imagen no válida.', res, 400);
        }

      } else {
        return displayCustom(res, 400, 'No has ingresado una imagen.');
      }
  },


  // ENLISTAR TODOS LOS CORREOS QUE ME ENVIARON
  getMyMails: function(req, res){
    const userId = req.user.sub;
    let page = 1;
    const items_per_page = 10;
    if(req.params.page){
      page = req.params.page;
    }

    Mail.find({ to: userId }).populate('from', 'name surname nickname').paginate(page, items_per_page, (err, mails) => {
        if(err) return HttpResponses.display500Error(res);
        if(!mails) return HttpResponses.display400Error(res);
        return res.status(200).send({ mails });
    });

  },


  // OBTENER UN MAIL EN CONCRETO
  getMail: function(req, res){
    const mailId = req.params.id;
    const userId = req.user.sub;
    Mail.findOne({_id: mailId}).populate('from', 'name surname nickname').exec((err, mail) => {
      console.log(mail);
        if(mail.to == userId || mail.from._id == userId){
            if(err) HttpResponses.display500Error(res);
            if(!mail) HttpResponses.display404Error(res);
            return res.status(200).send({ mail });
        } else {
          return HttpResponses.display403Error(res);
        }
    });
  },









}



/**** ****  FUNCIONALIDADES DE APOYO **** ****/

function removeUploadImage(file_path, message, res, code){
  fs.unlink(file_path, (err) => {
      return HttpResponses.displayCustom(res, code, message);
  });
}


module.exports = controller;
