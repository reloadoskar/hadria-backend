'use strict'
const con = require('../conections/hadriaUser')
// var Compra = require('../models/compra');
// var Egreso = require('../models/egreso')

var controller = {
    getCuentas: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        var Compra = conn.model('Compra',require('../schemas/compra') )
        Compra.find({
            $and:[
                {"status": {$ne: "CANCELADO"} }, 
                {"status": {$ne: "CERRADO"} },
                {"saldo": {$gt: 0} },
                ]
        })
            .select('clave folio importe saldo provedor fecha')
            .populate('provedor')
            .sort('folio')
            .exec( (err, docs) => {
                if (err){
                    return res.status(500).send({
                        status: 'error',
                        message: 'No se encontraron items',
                    })
                }

                return res.status(200).send({
                    status: 'success',
                    message: 'Items encontrados',
                    cuentas: docs
                })
            })
    },

    savePago: (req, res) => {
        var params = req.body
        Compra.findById(params.cuenta._id, (err, compra) => {
            if(err) res.status(404).send({status:"error", message: "No se encontró la cuenta."})
            compra.pagos.push({
                ubicacion: params.ubicacion,
                importe: params.importe,
                tipoPago: params.tipoPago,
                fecha: params.fecha,
                referencia: params.referencia
            })

            compra.saldo -= params.importe
            compra.save(err => {
                if(err){
                    res.status(500).send({
                        status: 'error',
                        message: 'El pago no se agregó.',
                    })
                }

                var egreso = new Egreso()

                egreso.compra = compra._id
                egreso.ubicacion = params.ubicacion
                egreso.fecha = params.fecha
                egreso.tipoPago = params.tipoPago
                egreso.importe = params.importe
                egreso.descripcion = "PAGO A: " + params.cuenta.provedor.nombre + "-" + params.cuenta.clave
                egreso.concepto = "PAGO"

                egreso.save((err) => {
                    if(err) {
                        res.status(404).send({status: 'error', message: 'No se guardo el egreso.'})
                    }
                    res.status(200).send({
                        status: 'success',
                        message: 'Pago agregado correctamente.',
                    })
                })

            })
        })
    },
}

module.exports = controller;