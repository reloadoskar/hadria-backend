'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MovimientoSchema = Schema({
    origen: {},
    destino: {},
    item: {},
    cantidad: Number,
    empaques: Number,
    pesadas: []
},{
    timestamps: true
});

module.exports = MovimientoSchema