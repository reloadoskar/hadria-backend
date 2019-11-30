'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductoSchema = Schema({
    clave: {type: String, unique: true},
    descripcion: {type: String, unique: true},
    costo: Number,
    unidad: String,
    empaque: String,
    precio1: Number,
    precio2: Number,
    precio3: Number,
},{
    timestamps: true
});

module.exports = mongoose.model('Producto', ProductoSchema);