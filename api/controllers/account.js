'use strict'

const HttpResponses = require('../services/httpResponses.js');
const Account = require('../models/account.js');
const Verification = require('../models/verification.js');

const controller = {

	/**  CAMBIAR LA CUENTA DE INACTIVA A ACTIVA **/
	changeToActive: function(req, res){
		const insertedCode = req.params.code;
		const userId = req.user.sub;

		Account.findOne({ user: userId }, (err, account) => {
			if(err) return HttpResponses.display500Error(res);
			if(!account) return HttpResponses.display400Error(res);
			Verification.findOne({ account: account._id }, (err, verification) => {
				if(err) return HttpResponses.display500Error(res);
				if(!verification) return HttpResponses.display400Error(res);

				// Comparar los dos códigos de verificación
				if(insertedCode == verification.code){
					
					// FALSE -> TRUE Actualizar
					Account.update({ _id: account._id }, {active: true}, {new: true}, (err, accActive) => {
						if(err) return HttpResponses.display500Error(res);
						if(!accActive) return httpResponses.displayCustom(res, 400, 'Algo salió mal en tu verificación.');

						// Eliminar documento de verificación
						Verification.remove({_id: verification._id}, (err, deletedVerification) => {
							if(err) return HttpResponses.display500Error(res);
							if(!verification) return HttpResponses.display400Error(res);

							return res.status(200).send({ account: accActive });
						});

					});
				} else {
					return HttpResponses.displayCustom(res, 400, 'Código de verificación incorrecta.');
				}
			});
		});
	}

}

module.exports = controller;
