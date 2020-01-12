'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ClienteSchema = Schema({
    nombre: {type: String, unique: true},
    rfc: {type: String},
    direccion: String,
    tel1: String,
    tel2: String,
    email: { type: String, unique: true},
    dias_de_credito: Number,
    limite_de_credito: Number,
    credito_disponible: Number,
},{
    timestamps: true
});

module.exports = mongoose.model('Cliente', ClienteSchema);
// module.exports = ClienteSchema