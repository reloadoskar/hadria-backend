'use strict'

var Venta = require('../models/venta');
var Ingreso = require('../models/ingreso');
var Cliente = require('../models/cliente');

var controller = {
    getCuentas: (req, res) => {
        Venta.find( { "saldo": {$gt: 0} } )
            .select("cliente total saldo fecha acuenta")
            .populate("cliente")
            .exec((err, docs) => {
                if (err){
                    return res.status(500).send({
                        status: 'error',
                        message: 'No se encontraron cuentas',
                    })
                }

                return res.status(200).send({
                    status: 'success',
                    message: 'Cuentas encontradas',
                    cuentas: docs
                })
            })
    },

    savePago: (req, res) => {
        var params = req.body
        
        Venta.findById(params.cuenta._id)
            .exec()
            .then(venta => {
                venta.pagos.push({
                    ubicacion: params.ubicacion,
                    fecha: params.fecha,
                    importe: params.importe,
                    tipoPago: params.tipoPago,
                    referencia: params.referencia,
                })

                venta.saldo -= parseFloat(params.importe)

                
                var ingreso = new Ingreso()
                ingreso.venta = params.cuenta._id
                ingreso.importe = params.importe
                ingreso.ubicacion = params.ubicacion
                ingreso.fecha = params.fecha                
                ingreso.concepto = "COBRANZA"
                ingreso.descripcion = "PAGO DE: " + params.cuenta.cliente.nombre + " " + params.referencia
                ingreso.tipoPago = params.tipoPago
                
                venta.save()
                ingreso.save()

                return Cliente.findById(params.cuenta.cliente._id)
                        .exec()
            })
            .then(cliente => {
                cliente.credito_disponible += parseFloat(params.importe)

                cliente.save()

                res.status(200).send({
                    status: 'success',
                    message: 'Cobro agregado correctamente.'
                })
            })
    }

}

module.exports = controller;