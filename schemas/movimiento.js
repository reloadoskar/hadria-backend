'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MovimientoSchema = Schema({
    origen: {},
    destino: {},
    item: {},
    clasificacion: String,
    cantidad: Number,
    empaques: Number,
    comentario: String,
    pesadas: [],
    tara: Number,
    ttara: Number,
    bruto: Number,
    neto: Number
},{
    timestamps: true
});

module.exports = MovimientoSchema