'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CompraSchema = Schema({
    folio: Number,
    clave: { type: String, unique: true},
    provedor: { type: Schema.ObjectId, ref: 'Provedor' },
    ubicacion: {type: Schema.ObjectId, ref: 'Ubicacion'},
    tipoCompra: {type: Schema.ObjectId, ref: 'TipoCompra'},
    items: [{ type: Schema.ObjectId, ref: 'CompraItem'}],
    gastos: [{ type: Schema.ObjectId, ref: 'Egreso'}],
    pagos: [{ type: Schema.ObjectId, ref: 'Egreso'}],
    ventas: [{ type: Schema.ObjectId, ref: 'Venta' }],
    movimientos:[{ type: Schema.ObjectId, ref: 'Movimiento' }],
    fecha: String,
    remision: String,
    saldo: Number,
    status: String,
    importe: Number,
},{
    timestamps: true
});

module.exports = CompraSchema