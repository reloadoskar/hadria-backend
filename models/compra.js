'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ItemsSchema = Schema({
    producto: { type: Schema.ObjectId, ref: 'Producto' },
    cantidad: Number,
    empaques: Number,
    stock: Number,
    costo: Number,
    importe: Number
},{
    timestamps: true
})

var CompraSchema = Schema({
    folio: Number,
    clave: { type: String, unique: true},
    provedor: { type: Schema.ObjectId, ref: 'Provedor' },
    ubicacion: {type: Schema.ObjectId, ref: 'Ubicacion'},
    tipoCompra: {type: Schema.ObjectId, ref: 'TipoCompra'},
    produccion: {type: Schema.ObjectId, ref: 'Produccion'},
    fecha: String,
    remision: Number,
    importe: Number,
    saldo: Number,
    status: String,
    // items: [ItemsSchema],
    items: [{ type: Schema.ObjectId, ref: 'CompraItem'}],
    pagos: [{
        ubicacion: { type: Schema.ObjectId, ref: 'Ubicacion' },
        fecha: Date,
        tipoPago: String,
        importe: Number,
        referencia: String
    }]
},{
    timestamps: true
});

module.exports = mongoose.model('Compra', CompraSchema);
// module.exports = CompraSchema