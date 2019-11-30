'use strict'

var validator = require('validator');
var Status = require('../models/status');

var controller = {
    save: (req, res) => {
        //recoger parametros
        var params = req.body;

        //validar datos
        try{
            var validate_nombre = !validator.isEmpty(params.nombre);
        }catch(err){
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos.'
            })
        }

        if(validate_nombre){
            //Crear el objeto a guardar
            var status = new Status();
            
            //Asignar valores
            status.nombre = params.nombre;

            //Guardar objeto
            status.save((err, statusStored) => {
                if(err || !statusStored){
                    return res.status(404).send({
                        status: 'error',
                        message: 'El status no se guardó'
                    })
                }
                //Devolver respuesta
                return res.status(200).send({
                    status: 'success',
                    status: statusStored
                })
            })


        }else{
            return res.status(200).send({
                status: 'error',
                message: 'Datos no validos.'
            })
        }

    },

    getStatuss: (req, res) => {
        Status.find({}).sort('_id').exec( (err, statuss) => {
            if(err || !statuss){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los statuss'
                })
            }

            return res.status(200).send({
                status: 'success',
                statuss
            })
        })
    },

    getStatus: (req, res) => {
        var statusId = req.params.id;

        if(!statusId){
            return res.status(404).send({
                status: 'error',
                message: 'No existe el status'
            })
        }

        Status.findById(statusId, (err, status) => {
            if(err || !status){
                return res.status(404).send({
                    status: 'success',
                    message: 'No existe el status.'
                })
            }
            return res.status(200).send({
                status: 'success',
                status
            })
        })
    },

    update: (req, res) => {
        var statusId = req.params.id;
        
        //recoger datos actualizados y validarlos
        var params = req.body;
        try{
            var validate_nombre = !validator.isEmpty(params.nombre);
        }catch(err){
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos.'
            })
        }

        if(validate_nombre){
            
            // Find and update
            Status.findOneAndUpdate({_id: statusId}, params, {new:true}, (err, statusUpdated) => {
                if(err){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar'
                    })
                }

                if(!statusUpdated){
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el status'
                    })
                }

                return res.status(200).send({
                    status: 'success',
                    statusUpdated
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
        var statusId = req.params.id;

        Status.findOneAndDelete({_id: statusId}, (err, statusRemoved) => {
            if(!statusRemoved){
                return res.status(500).send({
                    status: 'error',
                    message: 'No se pudo borrar el status.'
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
                statusRemoved
            })
        })

    }

}

module.exports = controller;