'use strict'
const con = require('../conections/hadriaUser')
var validator = require('validator');


var controller = {
    save: (req, res) => {
        //recoger parametros
        var params = req.body;
        const bd = req.params.bd
        const conn = con(bd)
        var Ubicacion = conn.model('Ubicacion',require('../schemas/ubicacion') )
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
            var ubicacion = new Ubicacion();
            
            //Asignar valores
            ubicacion.nombre = params.nombre.toUpperCase();

            //Guardar objeto
            ubicacion.save((err, ubicacionStored) => {
                if(err || !ubicacionStored){
                    return res.status(404).send({
                        status: 'error',
                        message: 'El ubicacion no se guardó'
                    })
                }
                //Devolver respuesta
                return res.status(200).send({
                    status: 'success',
                    message: 'Ubicación registrada correctamente.',
                    ubicacion: ubicacionStored
                })
            })


        }else{
            return res.status(200).send({
                status: 'error',
                message: 'Datos no validos.'
            })
        }

    },

    getUbicacions: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        var Ubicacion = conn.model('Ubicacion',require('../schemas/ubicacion') )
        Ubicacion.find({}).sort('_id').exec( (err, ubicacions) => {
            if(err || !ubicacions){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los ubicacions'
                })
            }

            return res.status(200).send({
                status: 'success',
                ubicacions: ubicacions
            })
        })
    },

    getUbicacion: (req, res) => {
        var ubicacionId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        var Ubicacion = conn.model('Ubicacion',require('../schemas/ubicacion') )
        if(!ubicacionId){
            return res.status(404).send({
                status: 'error',
                message: 'No existe el ubicacion'
            })
        }

        Ubicacion.findById(ubicacionId, (err, ubicacion) => {
            if(err || !ubicacion){
                return res.status(404).send({
                    status: 'success',
                    message: 'No existe el ubicacion.'
                })
            }
            return res.status(200).send({
                status: 'success',
                ubicacion
            })
        })
    },

    update: (req, res) => {
        var ubicacionId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        var Ubicacion = conn.model('Ubicacion',require('../schemas/ubicacion') )
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
            Ubicacion.findOneAndUpdate({_id: ubicacionId}, params, {new:true}, (err, ubicacionUpdated) => {
                if(err){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar'
                    })
                }

                if(!ubicacionUpdated){
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el ubicacion'
                    })
                }

                return res.status(200).send({
                    status: 'success',
                    ubicacion: ubicacionUpdated
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
        var ubicacionId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        var Ubicacion = conn.model('Ubicacion',require('../schemas/ubicacion') )
        Ubicacion.findOneAndDelete({_id: ubicacionId}, (err, ubicacionRemoved) => {
            if(!ubicacionRemoved){
                return res.status(500).send({
                    status: 'error',
                    message: 'No se pudo borrar el ubicacion.'
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
                message: 'Ubicación eliminada correctamente.',
                ubicacionRemoved
            })
        })

    }

}

module.exports = controller;