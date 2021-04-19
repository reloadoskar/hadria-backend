'use strict'

var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var UserSchema = Schema({
    nombre: {type: String},
    apellido: {type: String},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    tryPeriodEnds: String,
    paidPeriodEnds: String,
    database: String,
    level: Number
},{
    timestamps: true
});


module.exports = mongoose.model('User', UserSchema);