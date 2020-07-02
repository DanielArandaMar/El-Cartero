'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AccountSchema = Schema({
    user: {type: Schema.ObjectId, ref: 'User'},
    active: Boolean,
    recovery_mail: String,
    created_at: String
});
module.exports = mongoose.model('Account', AccountSchema);