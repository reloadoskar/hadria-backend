'use strict'

var validator = require('validator');
var TipoPago = require('../models/tipopago');

var controller = {
    save: (req, res) => {
        //recoger parametros
        var params = req.body;

        //validar datos
        try{
            var validate_tipo = !validator.isEmpty(params.tipo);
        }catch(err){
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos.'
            })
        }

        if(validate_tipo){
            //Crear el objeto a guardar
            var tipopago = new TipoPago();
            
            //Asignar valores
            tipopago.tipo = params.tipo;

            //Guardar objeto
            tipopago.save((err, tipopagoStored) => {
                if(err || !tipopagoStored){
                    return res.status(404).send({
                        status: 'error',
                        message: 'El tipopago no se guardó'
                    })
                }
                //Devolver respuesta
                return res.status(200).send({
                    status: 'success',
                    tipopago: tipopagoStored
                })
            })


        }else{
            return res.status(200).send({
                status: 'error',
                message: 'Datos no validos.'
            })
        }

    },

    getTipoPagos: (req, res) => {
        TipoPago.find({}).sort('_id').exec( (err, tipopagos) => {
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

        if(!tipopagoId){
            return res.status(404).send({
                status: 'error',
                message: 'No existe el tipopago'
            })
        }

        TipoPago.findById(tipopagoId, (err, tipopago) => {
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
        
        //recoger datos actualizados y validarlos
        var params = req.body;
        try{
            var validate_tipo = !validator.isEmpty(params.tipo);
        }catch(err){
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos.'
            })
        }

        if(validate_tipo){
            
            // Find and update
            TipoPago.findOneAndUpdate({_id: tipopagoId}, params, {new:true}, (err, tipopagoUpdated) => {
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

        }else{
            return res.status(200).send({
                status: 'error',
                message: 'Datos no validos.'
            })
        }

    },

    delete: (req, res) => {
        var tipopagoId = req.params.id;

        TipoPago.findOneAndDelete({_id: tipopagoId}, (err, tipopagoRemoved) => {
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