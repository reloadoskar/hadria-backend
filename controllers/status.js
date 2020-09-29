'use strict'
var mongoose = require('mongoose');
const con = require('../conections/hadriaUser')
var validator = require('validator');

var controller = {
    save: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        var Status = conn.model('Status',require('../schemas/status') )
        var params = req.body;

        //Crear el objeto a guardar
        var status = new Status();
        //Asignar valores
        status.nombre = params.nombre;
            

        //Guardar objeto
        status.save((err, statusStored) => {
                mongoose.connection.close()
                conn.close()
                if(err || !statusStored){
                    return res.status(404).send({
                        status: 'error',
                        message: 'El status no se guardó'
                    })
                }
                return res.status(200).send({
                    status: 'success',
                    status: statusStored
                })
            })

    },

    getStatuss: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        var Status = conn.model('Status',require('../schemas/status') )
        Status.find({}).sort('_id').exec( (err, statuss) => {
            mongoose.connection.close()
            conn.close()
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
        const bd = req.params.bd
        const conn = con(bd)
        var Status = conn.model('Status',require('../schemas/status') )

        if(!statusId){
            mongoose.connection.close()
            conn.close()
            return res.status(404).send({
                status: 'error',
                message: 'No existe el status'
            })
        }

        Status.findById(statusId, (err, status) => {
            mongoose.connection.close()
            conn.close()
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
        const bd = req.params.bd
        const conn = con(bd)
        var params = req.body;
        var Status = conn.model('Status',require('../schemas/status') )
        //recoger datos actualizados y validarlos
        try{
            var validate_nombre = !validator.isEmpty(params.nombre);
        }catch(err){
            mongoose.connection.close()
            conn.close()
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos.'
            })
        }

        if(validate_nombre){
            
            // Find and update
            Status.findOneAndUpdate({_id: statusId}, params, {new:true}, (err, statusUpdated) => {
                mongoose.connection.close()
                conn.close()
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
            mongoose.connection.close()
            conn.close()
            return res.status(200).send({
                status: 'error',
                message: 'Datos no validos.'
            })
        }

    },

    delete: (req, res) => {
        var statusId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        var Status = conn.model('Status',require('../schemas/status') )

        Status.findOneAndDelete({_id: statusId}, (err, statusRemoved) => {
            mongoose.connection.close()
            conn.close()
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