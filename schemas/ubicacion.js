'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UbicacionSchema = Schema({
    nombre: {type: String, unique: true},
});

module.exports = UbicacionSchema