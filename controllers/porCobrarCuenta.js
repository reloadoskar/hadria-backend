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
        Venta.aggregate()
         .match({ saldo: {$gt: 0} })
         .lookup({from: 'clientes', localField: 'cliente', foreignField: '_id', as: 'cliente'})
         .lookup({from: 'ventaitems', localField: 'items', foreignField: '_id', as: 'items'})
         .unwind("items")
         .lookup({from: 'productos', localField: 'items.producto', foreignField: '_id', as: 'items.producto'})
         .unwind("items.producto")
        //  .lookup({form: 'ubicacions', localField:"pagos.ubicacion", foreignField: "_id", as: "pagos.ubicacion" })
        //  .unwind("pagos.ubicacion")
         .project({
             "folio":1,
             "fecha":1,
             "importe":1,
             "saldo":1,
             "pagos":1,
            //  "pa":1,
             "cliente.nombre":1,
             "items.cantidad":1,
             "items.precio":1,
             "items.importe":1,
             "items.producto.descripcion":1,
            })
        .group({
            _id: "$cliente.nombre",
            saldo: {$sum: "$saldo"},
            ventas: {$push: {folio: "$folio", fecha: "$fecha", importe: "$importe", saldo: "$saldo", items: "$items", pagos: "$pagos"}}

        })
         .exec((err, ventas) => {
             if (err){
                 return res.status(500).send({
                     status: "error",
                     err
                 })
             } 
             return res.status(200).send({
                 status: "success",
                 ventas
             })
         })
        // Venta.find( { "saldo": {$gt: 0} } )
        //     .select("cliente importe saldo fecha acuenta folio")
        //     .populate("cliente")
        //     .exec((err, docs) => {
        //         mongoose.connection.close()
        //         conn.close()
        //         if (err){
        //             return res.status(500).send({
        //                 status: 'error',
        //                 message: 'No se encontraron cuentas',
        //             })
        //         }
        //         return res.status(200).send({
        //             status: 'success',
        //             message: 'Cuentas encontradas',
        //             cuentas: docs
        //         })
        //     })
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