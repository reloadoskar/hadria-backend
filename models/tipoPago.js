'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TipoPagoSchema = Schema({
    tipo: {type: String, unique: true},
});

module.exports = mongoose.model('TipoPago', TipoPagoSchema);