'use strict'

var Venta = require('../models/venta')
var Ingreso = require('../models/ingreso')
var Egreso = require('../models/egreso')
var Compra = require('../models/compra')
var CompraItem = require('../models/compra_item')
var Ubicacion = require('../models/ubicacion')

var controller = {
    getBalance: (req, res) => {
        var balance = {}
        // traemos ventas a crédito
        Venta
        .find({"tipoPago": "CRÉDITO", "saldo": {$gt: 0}})
        .select('ubicacion cliente tipoPago acuenta saldo importe')
        .populate('ubicacion')
        .populate('cliente')
        .sort('ubicacion cliente tipoPago acuenta saldo importe')
        .exec()
        .then(porCobrar => {

            balance.porCobrar = porCobrar
            
            return Ingreso.find({})
                .select('ubicacion concepto descripcion fecha importe')
                .populate('ubicacion')
                .sort('ubicacion concepto descripcion fecha importe')
                .exec()
        })
        .then( ingresos => {

            balance.ingresos = ingresos

            return Egreso.find({})
                .select("ubicacion concepto descripcion fecha importe")
                .populate('ubicacion')
                .sort('ubicacion concepto descripcion fecha importe')
                .exec()

        })
        .then( egresos => {
            balance.egresos = egresos

            return Ubicacion
                .aggregate()
                .lookup({ from: 'ingresos', localField: "_id", foreignField: 'ubicacion', as: 'ingresos' })
                .lookup({ from: 'egresos', localField: "_id", foreignField: 'ubicacion', as: 'egresos' })
                .exec()

        })
        .then( disponiblePorUbicacion =>{
            balance.disponiblePorUbicacion = disponiblePorUbicacion
                
            return Compra.find({"saldo": {$gt: 0}})
                .select('provedor ubicacion fecha saldo clave')
                .populate('provedor')
                .populate('ubicacion')
                .exec()
        })
        .then( porPagar => {
            balance.porPagar = porPagar

            return CompraItem.find({"stock": {$gt: 0}})
                .select('stock costo')
                .exec()
            })
        .then( inventario => {
            balance.inventario = inventario
            res.status(200).send({
                balance
            })
        })
    },
}

module.exports = controller