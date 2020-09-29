'use strict'
var mongoose = require('mongoose');
const con = require('../conections/hadriaUser')

var controller = {
    save: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        var TipoPago = conn.model('TipoPago', require('../schemas/tipoPago') )
        //recoger parametros
        var params = req.body;


            //Crear el objeto a guardar
            var tipopago = new TipoPago();
            
            //Asignar valores
            tipopago.tipo = params.tipo;

            //Guardar objeto
            tipopago.save((err, tipopagoStored) => {
                mongoose.connection.close()
                conn.close()
                if(err || !tipopagoStored){
                    return res.status(404).send({
                        status: 'error',
                        message: 'El tipopago no se guardó'
                    })
                }
                return res.status(200).send({
                    status: 'success',
                    tipopago: tipopagoStored
                })
            })

    },

    getTipoPagos: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        var TipoPago = conn.model('TipoPago', require('../schemas/tipoPago') )
        TipoPago.find({}).sort('_id').exec( (err, tipopagos) => {
            mongoose.connection.close()
            conn.close()
            if(err || !tipopagos){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los tipopagos'
                })
            }
            return res.status(200).send({
                status: 'success',
                tipopagos
            })
        })
    },

    getTipoPago: (req, res) => {
        var tipopagoId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        var TipoPago = conn.model('TipoPago', require('../schemas/tipoPago') )
        if(!tipopagoId){
            mongoose.connection.close()
            conn.close()
            return res.status(404).send({
                status: 'error',
                message: 'No existe el tipopago'
            })
        }

        TipoPago.findById(tipopagoId, (err, tipopago) => {
            mongoose.connection.close()
            conn.close()
            if(err || !tipopago){
                return res.status(404).send({
                    status: 'success',
                    message: 'No existe el tipopago.'
                })
            }
            return res.status(200).send({
                status: 'success',
                tipopago
            })
        })
    },

    update: (req, res) => {
        var tipopagoId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        var TipoPago = conn.model('TipoPago', require('../schemas/tipoPago') )
        //recoger datos actualizados y validarlos
        var params = req.body;
            
            // Find and update
            TipoPago.findOneAndUpdate({_id: tipopagoId}, params, {new:true}, (err, tipopagoUpdated) => {
                mongoose.connection.close()
                conn.close()
                if(err){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar'
                    })
                }

                if(!tipopagoUpdated){
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el tipopago'
                    })
                }
                return res.status(200).send({
                    status: 'success',
                    tipopago: tipopagoUpdated
                })

            })

    },

    delete: (req, res) => {
        var tipopagoId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        var TipoPago = conn.model('TipoPago', require('../schemas/tipoPago') )
        TipoPago.findOneAndDelete({_id: tipopagoId}, (err, tipopagoRemoved) => {
            mongoose.connection.close()
            conn.close()
            if(!tipopagoRemoved){
                return res.status(500).send({
                    status: 'error',
                    message: 'No se pudo borrar el tipopago.'
                })
            }
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Ocurrio un error.'
                })
            }
            return res.status(200).send({
                status: 'success',
                tipopagoRemoved
            })
        })

    }

}

module.exports = controller;