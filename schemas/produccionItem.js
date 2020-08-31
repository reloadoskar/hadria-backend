'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProduccionItemSchema = Schema({
    produccion: { type: Schema.ObjectId, ref: 'Produccion'},
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

module.exports = ProduccionItemSchema