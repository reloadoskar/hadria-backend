'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var IngresoSchema = Schema({
    concepto: String,
    venta: { type: Schema.ObjectId, ref: 'Venta'},
    ubicacion: { type: Schema.ObjectId, ref: 'Ubicacion' },
    // cliente: { type: Schema.ObjectId, ref: 'Cliente' },
    // items: [{ type: Schema.ObjectId, ref: 'VentaItem' }],
    fecha: String,
    tipoPago: String,
    importe: Number,
    acuenta: Number,
    saldo: Number,
    descripcion: String,
},{
    timestamps: true
});

module.exports = IngresoSchema