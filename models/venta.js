'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VentaSchema = Schema({
    folio: Number,
    ingreso: {type: Schema.ObjectId, ref: 'Ingreso'},
    ubicacion: { type: Schema.ObjectId, ref: 'Ubicacion' },
    cliente: { type: Schema.ObjectId, ref: 'Cliente' },
    fecha: String,
    tipoPago: String,
    importe: Number,
    acuenta: Number,
    saldo: Number,
    items: [{type: Schema.ObjectId, ref: 'VentaItem'}],
    pagos: [{
        ubicacion: { type: Schema.ObjectId, ref: 'Ubicacion' },
        fecha: String,
        importe: Number
    }],
    status: String,
},{
    timestamps: true
});

module.exports = mongoose.model('Venta', VentaSchema);