'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var IngresoSchema = Schema({
    venta: { type: Schema.ObjectId, ref: 'Venta'},
    ubicacion: { type: Schema.ObjectId, ref: 'Ubicacion' },
    cliente: { type: Schema.ObjectId, ref: 'Cliente' },
    fecha: String,
    tipoPago: String,
    importe: Number,
    acuenta: Number,
    saldo: Number,
    pagos: [{
        ubicacion: { type: Schema.ObjectId, ref: 'Ubicacion' },
        fecha: String,
        importe: Number
    }],
    descripcion: String,
    concepto: String,
},{
    timestamps: true
});

module.exports = mongoose.model('Ingreso', IngresoSchema);