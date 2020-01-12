'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProvedorSchema = Schema({
    nombre: {type: String, unique: true},
    clave: {type: String, unique: true},
    rfc: String,
    direccion: String,
    tel1: Number,
    tel2: Number,
    email: {type: String, unique: true},
    cta1: Number,
    cta2: Number,
    diasDeCredito: Number,
    comision: Number,
},{
    timestamps: true
});

// module.exports = mongoose.model('Provedor', ProvedorSchema);
module.exports = ProvedorSchema