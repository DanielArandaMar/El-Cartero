'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const MailSchema = Schema({
    from: {type: Schema.ObjectId, ref: 'User'},
    to: {type: Schema.ObjectId, ref: 'User'},
    content: String,
    image: String,
    anonymouse: Boolean,
    deleted_from: Boolean,
    deleted_to: Boolean,
    created_at: String
});
module.exports = mongoose.model('Mail', MailSchema);
