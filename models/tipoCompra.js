'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TipoCompraSchema = Schema({
    tipo: {type: String, unique: true},
});

module.exports = mongoose.model('TipoCompra', TipoCompraSchema);