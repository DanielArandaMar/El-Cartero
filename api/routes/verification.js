'use strict'

const express = require('express');
const api = express.Router();
const auth_md = require('../middlewares/authenticated');
const VerificationController = require('../controllers/verification');

/* ELIMINAR DOCUMENTO DE VERIFICACION */
api.delete('/verification/delete/:accountId', auth_md.auth, VerificationController.deleteVerification);

module.exports = api;