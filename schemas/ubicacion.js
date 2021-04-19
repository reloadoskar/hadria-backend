'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UbicacionSchema = Schema({
    nombre: {type: String, unique: true},
    tipo: {type: String},
});

module.exports = UbicacionSchema