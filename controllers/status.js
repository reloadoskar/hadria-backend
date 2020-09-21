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
            conn.close()
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
                    conn.close()
                    return res.status(404).send({
                        status: 'error',
                        message: 'El status no se guardó'
                    })
                }
                //Devolver respuesta
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    status: statusStored
                })
            })


        }else{
            conn.close()
            return res.status(200).send({
                status: 'error',
                message: 'Datos no validos.'
            })
        }

    },

    getStatuss: (req, res) => {
        Status.find({}).sort('_id').exec( (err, statuss) => {
            if(err || !statuss){
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los statuss'
                })
            }
            conn.close()
            return res.status(200).send({
                status: 'success',
                statuss
            })
        })
    },

    getStatus: (req, res) => {
        var statusId = req.params.id;

        if(!statusId){
            conn.close()
            return res.status(404).send({
                status: 'error',
                message: 'No existe el status'
            })
        }

        Status.findById(statusId, (err, status) => {
            if(err || !status){
                conn.close()
                return res.status(404).send({
                    status: 'success',
                    message: 'No existe el status.'
                })
            }
            conn.close()
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
            conn.close()
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos.'
            })
        }

        if(validate_nombre){
            
            // Find and update
            Status.findOneAndUpdate({_id: statusId}, params, {new:true}, (err, statusUpdated) => {
                if(err){
                    conn.close()
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar'
                    })
                }

                if(!statusUpdated){
                    conn.close()
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el status'
                    })
                }
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    statusUpdated
                })

            })

        }else{
            conn.close()
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
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    message: 'No se pudo borrar el status.'
                })
            }
            if(err){
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    message: 'Ocurrio un error.'
                })
            }
            conn.close()
            return res.status(200).send({
                status: 'success',
                statusRemoved
            })
        })

    }

}

module.exports = controller;