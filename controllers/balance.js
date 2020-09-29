'use strict'
var mongoose = require('mongoose')
const con = require('../conections/hadriaUser')

var controller = {
    getBalance: (req, res) => {
        var bd = req.params.bd
        const conn = con(bd)

        var Venta = conn.model('Venta',require('../schemas/venta') )
        var Ingreso = conn.model('Ingreso', require('../schemas/ingreso') )
        var Egreso = conn.model('Egreso', require('../schemas/egreso') )
        var Compra = conn.model('Compra', require('../schemas/compra') )
        var CompraItem = conn.model('CompraItem', require('../schemas/compra_item') )
        var Ubicacion = conn.model('Ubicacion',require('../schemas/ubicacion') )


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
                
            return Compra.find({"status": "ACTIVO", "saldo": {$gt: 0}})
                .select('provedor ubicacion fecha folio saldo clave')
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
            conn.close()
            mongoose.connection.close()
            res.status(200).send({
                balance
            })
        })
    },
}

module.exports = controller