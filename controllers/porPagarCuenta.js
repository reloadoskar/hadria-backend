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
                    conn.close()
                    return res.status(500).send({
                        status: 'error',
                        message: 'No se encontraron items',
                    })
                }
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    message: 'Items encontrados',
                    cuentas: docs
                })
            })
    },

    savePago: (req, res) => {
        var params = req.body
        const bd = req.params.bd
        const conn = con(bd)
        var Compra = conn.model('Compra',require('../schemas/compra') )
        var Egreso = conn.model('Egreso',require('../schemas/egreso') )
        
        Compra.findById(params.cuenta._id)
            .exec()
            .then(compra => {
                compra.pagos.push({
                    ubicacion: params.ubicacion,
                    importe: params.importe,
                    tipoPago: params.tipoPago,
                    fecha: params.fecha,
                    referencia: params.referencia
                })
                compra.saldo -= params.importe

                
                var egreso = new Egreso()

                    egreso.compra = params.cuenta._id
                    egreso.ubicacion = params.ubicacion
                    egreso.fecha = params.fecha
                    egreso.tipoPago = params.tipoPago
                    egreso.importe = params.importe
                    egreso.descripcion = "PAGO A: " + params.cuenta.provedor.nombre + "-" + params.cuenta.clave
                    egreso.concepto = "PAGO"
                    // console.log(egreso)
                    // console.log(compra)
                    egreso.save().catch(err => { console.log(err) } )
                    compra.save()
                    .then(()=>{
                        conn.close()
                    })
                    .catch(err => { console.log(err) } )
                    return res.status(200).send({
                        status: 'success',
                        message: 'Pago agregado correctamente.'
                    })
                // })


            })

    },
}

module.exports = controller;