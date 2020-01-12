'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EgresoSchema = Schema({
    folio: Number, 
    tipo: String,
    ubicacion: { type: Schema.ObjectId, ref: 'Ubicacion' },
    concepto: String,
    descripcion: String,
    fecha: String,
    importe: Number,
    compra: {type: Schema.ObjectId, ref: 'Compra'},
},{
    timestamps: true
});

// module.exports = mongoose.model('Egreso', EgresoSchema);
module.exports = EgresoSchema