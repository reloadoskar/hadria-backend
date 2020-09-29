'use strict'
var mongoose = require('mongoose');
const con = require('../conections/hadriaUser')

var controller = {
    save: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        var Venta = conn.model('Venta',require('../schemas/venta') )
        var Cliente = conn.model('Cliente',require('../schemas/cliente') )
        var params = req.body
        var venta = new Venta()
        Venta.estimatedDocumentCount((err, count) => {
            venta._id = mongoose.Types.ObjectId(),
            venta.folio = ++count
            venta.cliente = params.cliente
            venta.fecha = params.fecha
            venta.importe = params.importe 
            venta.saldo = params.importe
            venta.tipoPago = 'CRÉDITO'

            Cliente.findById(params.cliente._id, (err, cliente) => {
                if(err)console.log(err)
                let creditoDisponible = cliente.credito_disponible
                let creditoActualizado = creditoDisponible - venta.saldo
                cliente.credito_disponible = creditoActualizado
                cliente.save((err, cliente) => {
                    if(err)console.log(err)
                })
            })

            venta.save( (err, ventaSaved) => {
                mongoose.connection.close()
                conn.close()
                if(err){
                    return res.status(404).send({
                        status: "error",
                        message: "Error al guardar la venta",
                        err
                    })
                }
                else{
                    return res.status(200).send({
                        status: "success",
                        message: "Venta guardada correctamente.",
                        venta: ventaSaved
                    })
                }        
            })
                       
        })
        
    },
    getCuentas: (req, res) => {
        const bd= req.params.bd
        const conn = con(bd)
        var Venta = conn.model('Venta',require('../schemas/venta') )
        Venta.find( { "saldo": {$gt: 0} } )
            .select("cliente importe saldo fecha acuenta folio")
            .populate("cliente")
            .exec((err, docs) => {
                mongoose.connection.close()
                conn.close()
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
        const bd = req.params.bd
        const conn = con(bd)
        var Venta = conn.model('Venta',require('../schemas/venta') )
        var Ingreso = conn.model('Ingreso',require('../schemas/ingreso') )
        var Cliente = conn.model('Cliente',require('../schemas/cliente') )
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

                mongoose.connection.close()
                conn.close()
                res.status(200).send({
                    status: 'success',
                    message: 'Cobro agregado correctamente.'
                })
            })
    }

}

module.exports = controller;