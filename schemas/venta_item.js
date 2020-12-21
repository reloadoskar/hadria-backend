'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VentaItemSchema = Schema({
    venta: {type: Schema.ObjectId, ref: 'Venta'},
    ventaFolio: Number,
    ubicacion: {type: Schema.ObjectId, ref: 'Ubicacion'},
    fecha: String,
    compra: {type: Schema.ObjectId, ref: 'Compra'},
    compraItem: {type: Schema.ObjectId, ref: 'CompraItem'},
    producto: { type: Schema.ObjectId, ref: 'Producto' },
    cantidad: Number,
    empaques: Number,
    precio: Number,
    importe: Number,
},{
    timestamps: true
});

// module.exports = mongoose.model('VentaItem', VentaItemSchema);
module.exports = VentaItemSchema