'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProduccionSchema = Schema({
    clave: {type: String, unique: true},
    folio: {type: Number, unique: true},
    fecha: String,
    compras: [{ type: Schema.ObjectId, ref: 'Compra' }],
    egresos: [{ type: Schema.ObjectId, ref: 'Egreso' }],
    items: [{ type: Schema.ObjectId, ref: 'ProduccionItem'}],    
    costo: Number,
    valor: Number,
    status: { type: String },
},{
    timestamps: true
});

module.exports = ProduccionSchema
// module.exports = mongoose.model('Produccion', ProduccionSchema);