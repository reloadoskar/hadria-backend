'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CompraItemSchema = Schema({
    compra: { type: Schema.ObjectId, ref: 'Compra'},
    producto: { type: Schema.ObjectId, ref: 'Producto' },
    provedor: { type: Schema.ObjectId, ref: 'Provedor' },
    cantidad: Number,
    empaques: Number,
    empaquesStock: Number,
    stock: Number,
    costo: Number,
    importe: Number
},{
    timestamps: true
})

// module.exports = mongoose.model('CompraItem', CompraItemSchema);
module.exports = CompraItemSchema