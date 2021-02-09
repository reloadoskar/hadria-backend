'use strict'
var mongoose = require('mongoose');
const con = require('../conections/hadriaUser')

var controller = {
    save: (req, res) => {
        //recoger parametros
        var params = req.body;
        const bd = req.params.bd
        const conn = con(bd)
        var Ubicacion = conn.model('Ubicacion',require('../schemas/ubicacion') )

            //Crear el objeto a guardar
            var ubicacion = new Ubicacion();
            
            //Asignar valores
            ubicacion.nombre = params.nombre.toUpperCase();
            ubicacion.tipo = params.tipo.toUpperCase();

            //Guardar objeto
            ubicacion.save((err, ubicacionStored) => {
                mongoose.connection.close()
                conn.close()
                if(err || !ubicacionStored){
                    return res.status(404).send({
                        status: 'error',
                        message: 'El ubicacion no se guardó'
                    })
                }
                return res.status(200).send({
                    status: 'success',
                    message: 'Ubicación registrada correctamente.',
                    ubicacion: ubicacionStored
                })
            })

    },

    getUbicacions: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        var Ubicacion = conn.model('Ubicacion',require('../schemas/ubicacion') )
        Ubicacion.find({}).sort('nombre').exec( (err, ubicacions) => {

            mongoose.connection.close()
            conn.close()
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

    getUbicacionsSaldo: (req, res) => {

    },

    getUbicacion: (req, res) => {
        var ubicacionId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        var Ubicacion = conn.model('Ubicacion',require('../schemas/ubicacion') )

        Ubicacion.findById(ubicacionId, (err, ubicacion) => {
            conn.close()
            if(err || !ubicacion){
                return res.status(404).send({
                    status: 'success',
                    message: 'No existe la ubicacion.'
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
            
            // Find and update
            Ubicacion.findOneAndUpdate({_id: ubicacionId}, params, {new:true}, (err, ubicacionUpdated) => {
                mongoose.connection.close()
                conn.close()
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

    },

    delete: (req, res) => {
        var ubicacionId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        var Ubicacion = conn.model('Ubicacion')
        var Compra = conn.model('Compra')

        Compra.find({"ubicacion": ubicacionId, "status": "ACTIVO"}).exec((err, compras)=>{
            if(err){console.log(err)}
            if(compras.length > 0){
                return res.status(200).send({
                    status: "warning",
                    message: "No se puede eliminar la ubicación, existen COMPRAS ACTIVAS relacionadas a éste.",
                    compras
                })
            }else{
                Ubicacion.findOneAndDelete({_id: ubicacionId}, (err, ubicacionRemoved) => {
                    mongoose.connection.close()
                    conn.close()
                    if(!ubicacionRemoved){
                        return res.status(500).send({
                            status: 'error',
                            message: 'No se pudo borrar la ubicación.'
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
        })

    }

}

module.exports = controller;