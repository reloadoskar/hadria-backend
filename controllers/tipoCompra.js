'use strict'
const con = require('../conections/hadriaUser')
var validator = require('validator');

var controller = {
    save: (req, res) => {
        //recoger parametros
        var params = req.body;
        const bd = req.params.bd
        const conn = con(bd)
        var TipoCompra = conn.model('TipoCompra', require('../schemas/tipoCompra') )
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
            var tipocompra = new TipoCompra();
            
            //Asignar valores
            tipocompra.tipo = params.tipo;

            //Guardar objeto
            tipocompra.save((err, tipocompraStored) => {
                if(err || !tipocompraStored){
                    return res.status(404).send({
                        status: 'error',
                        message: 'El tipocompra no se guardó'
                    })
                }
                //Devolver respuesta
                return res.status(200).send({
                    status: 'success',
                    tipocompra: tipocompraStored
                })
            })


        }else{
            return res.status(200).send({
                status: 'error',
                message: 'Datos no validos.'
            })
        }

    },

    getTipoCompras: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        var TipoCompra = conn.model('TipoCompra', require('../schemas/tipoCompra') )
        TipoCompra.find({}).sort('_id').exec( (err, tipocompras) => {
            if(err || !tipocompras){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los tipocompras'
                })
            }

            return res.status(200).send({
                status: 'success',
                tipoCompras: tipocompras
            })
        })
    },

    getTipoCompra: (req, res) => {
        var tipocompraId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        var TipoCompra = conn.model('TipoCompra', require('../schemas/tipoCompra') )
        if(!tipocompraId){
            return res.status(404).send({
                status: 'error',
                message: 'No existe el tipocompra'
            })
        }

        TipoCompra.findById(tipocompraId, (err, tipocompra) => {
            if(err || !tipocompra){
                return res.status(404).send({
                    status: 'success',
                    message: 'No existe el tipocompra.'
                })
            }
            return res.status(200).send({
                status: 'success',
                tipocompra
            })
        })
    },

    update: (req, res) => {
        var tipocompraId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        var TipoCompra = conn.model('TipoCompra', require('../schemas/tipoCompra') )
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
            TipoCompra.findOneAndUpdate({_id: tipocompraId}, params, {new:true}, (err, tipocompraUpdated) => {
                if(err){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar'
                    })
                }

                if(!tipocompraUpdated){
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el tipocompra'
                    })
                }

                return res.status(200).send({
                    status: 'success',
                    tipocompra: tipocompraUpdated
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
        var tipocompraId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        var TipoCompra = conn.model('TipoCompra', require('../schemas/tipoCompra') )
        TipoCompra.findOneAndDelete({_id: tipocompraId}, (err, tipocompraRemoved) => {
            if(!tipocompraRemoved){
                return res.status(500).send({
                    status: 'error',
                    message: 'No se pudo borrar el tipocompra.'
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
                tipocompraRemoved
            })
        })

    }

}

module.exports = controller;