'use strict'

var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var UserSchema = Schema({
    nombre: {type: String},
    apellido: {type: String},
    //telefono: {type: String, trim: true, unique: true},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    database: String,
    level: Number
},{
    timestamps: true
});


module.exports = UserSchema
//mongoose.model('User', UserSchema);