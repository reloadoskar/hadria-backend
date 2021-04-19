'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProvedorSchema = Schema({
    nombre: {type: String, unique: true},
    clave: {type: String, unique: true},
    cuentas: [{type: Schema.ObjectId, ref: 'Egreso' }],
    pagos: [{type: Schema.ObjectId, ref: 'Egreso'}],
    rfc: String,
    direccion: String,
    tel1: Number,
    tel2: Number,
    email: {type: String},
    cta1: Number,
    cta2: Number,
    diasDeCredito: Number,
    comision: Number,
},{
    timestamps: true
});

module.exports = ProvedorSchema