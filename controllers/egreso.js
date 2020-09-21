'use strict'
const con = require('../conections/hadriaUser')
var validator = require('validator');
// var Egreso = require('../models/egreso');
// var Compra = require('../models/compra');

var controller = {
    save: (req, res) => {
        //recoger parametros
        var params = req.body;
        const bd = req.params.bd
        const conn = con(bd)
        var Egreso = conn.model('Egreso',require('../schemas/egreso') )
        var Compra = conn.model('Compra',require('../schemas/compra') )
        var egreso = new Egreso()
        Egreso.estimatedDocumentCount((err, count) => {
            egreso.folio = ++count
            egreso.ubicacion = params.ubicacion
            egreso.concepto = params.concepto
            egreso.tipo = params.tipo
            egreso.descripcion = params.descripcion
            egreso.fecha = params.fecha
            egreso.importe = params.importe
            if(params.compra !== 1){
                egreso.compra = params.compra 
                // Tal vez sea bueno guardar un subdocumento en comrpas con el id de este egreso. talvez........
            }
            egreso.save((err, egreso) => {
                if( err || !egreso){
                    conn.close()
                    return res.status(404).send({
                        status: 'error',
                        message: 'No se registró el egreso.' + err
                    })
                }
                if(params.compra !== 1){
                    Compra.findById(params.compra).exec((err, compra) => {
                        if(err)console.log(err)
                        compra.saldo -= egreso.importe
                        compra.save()
                    })
                }
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    message: 'Egreso registrado correctamente.'
                })
            })
        })
    },

    getEgresos: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        var Egreso = conn.model('Egreso',require('../schemas/egreso') )
        var Ubicacion = conn.model('Ubicacion',require('../schemas/ubicacion') )
        var Compra = conn.model('Compra',require('../schemas/compra') )
        Egreso.find({}).sort('_id')
            .populate('ubicacion')
            .populate('compra', 'clave')
            .sort({concepto: 'asc'})
            .exec((err, egresos) => {
                if (err || !egresos) {
                    conn.close()
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al devolver los egresos' + err
                    })
                }
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    egresos
                })
            })
    },

    getEgreso: (req, res) => {
        var egresoId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        var Egreso = conn.model('Egreso',require('../schemas/egreso') )
        if (!egresoId) {
            conn.close()
            return res.status(404).send({
                status: 'error',
                message: 'No existe el egreso'
            })
        }

        Egreso.findById(egresoId, (err, egreso) => {
            if (err || !egreso) {
                conn.close()
                return res.status(404).send({
                    status: 'success',
                    message: 'No existe el egreso.'
                })
            }
            conn.close()
            return res.status(200).send({
                status: 'success',
                egreso
            })
        })
            .populate('compra', 'clave')
    },

    update: (req, res) => {
        var egresoId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        var Egreso = conn.model('Egreso',require('../schemas/egreso') )        
        //recoger datos actualizados y validarlos
        var params = req.body;
        try {
            var validate_ubicacion = !validator.isEmpty(params.ubicacion);
            var validate_descripcion = !validator.isEmpty(params.descripcion);
            var validate_fecha = !validator.isEmpty(params.fecha);
            var validate_importe = !validator.isEmpty(params.importe);
            var validate_tipo_pago = !validator.isEmpty(params.tipo_pago);
        } catch (err) {
            conn.close()
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos.'
            })
        }

        if (validate_ubicacion && validate_descripcion && validate_fecha && validate_importe && validate_tipo_pago) {

            // Find and update
            Egreso.findOneAndUpdate({ _id: egresoId }, params, { new: true }, (err, egresoUpdated) => {
                if (err) {
                    conn.close()
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar'
                    })
                }

                if (!egresoUpdated) {
                    conn.close()
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el egreso'
                    })
                }
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    egreso: egresoUpdated
                })

            })

        } else {
            conn.close()
            return res.status(200).send({
                status: 'error',
                message: 'Datos no validos.'
            })
        }

    },

    delete: (req, res) => {
        var egresoId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        var Egreso = conn.model('Egreso',require('../schemas/egreso') )
        Egreso.findById(egresoId, (err, egreso) => {
            if(egreso.compra){
                return res.status(500).send({
                    status: 'error',
                    message: 'No se puede eliminar este egreso, esta relacionado a una compra, acceda a compras para eliminarlo desde ahí'
                })
            }
            //         compra.pagos.egreso(egresoId).remove()
            //         compra.saldo = compra.saldo + egreso.importe
            //         compra.save((err, compraUpdated) => {
            //             if (err || !compraUpdated) {
            //                 console.log('error' + err);
            //             }
            //         })
            //     })
            // }
            Egreso.findOneAndDelete({ _id: egresoId }, (err, egresoRemoved) => {
                if (err || !egresoRemoved) {
                    conn.close()
                    return res.status(500).send({
                        status: 'error',
                        message: 'No se pudo borrar el egreso.'
                    })
                }
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    egresoRemoved
                })
            })
        })


    }

}

module.exports = controller;