'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CorteSchema = Schema({
    ubicacion: {type: Schema.ObjectId, ref: 'Ubicacion'},
    fecha: {type: String},
    ventas: [{
        // venta: {type: Schema.ObjectId, ref: 'Venta'},
    }],
    creditos: [{
        // venta: {type: Schema.ObjectId, ref: 'Venta'},
    }],
    ingresos: [{
        // ingreso: {type: Schema.ObjectId, ref: 'Ingreso'},
    }],
    egresos: [{
        // egreso: {type: Schema.ObjectId, ref: 'Egreso'},
    }],
    total: Number,
    tacuenta: Number,
    tcreditos: Number,
    tingresos: Number,
    tegresos: Number,
    tventas: Number,
    
},{
    timestamps: true
});

module.exports = CorteSchema