'use strict'

var validator = require('validator');
const con = require('../conections/hadriaUser')

var controller = {
    save: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        var TipoPago = conn.model('TipoPago', require('../schemas/tipoPago') )
        //recoger parametros
        var params = req.body;

        //validar datos
        try{
            var validate_tipo = !validator.isEmpty(params.tipo);
        }catch(err){
            conn.close()
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
                    conn.close()
                    return res.status(404).send({
                        status: 'error',
                        message: 'El tipopago no se guardó'
                    })
                }
                //Devolver respuesta
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    tipopago: tipopagoStored
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

    getTipoPagos: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        var TipoPago = conn.model('TipoPago', require('../schemas/tipoPago') )
        TipoPago.find({}).sort('_id').exec( (err, tipopagos) => {
            if(err || !tipopagos){
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los tipopagos'
                })
            }
            conn.close()
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
            conn.close()
            return res.status(404).send({
                status: 'error',
                message: 'No existe el tipopago'
            })
        }

        TipoPago.findById(tipopagoId, (err, tipopago) => {
            if(err || !tipopago){
                conn.close()
                return res.status(404).send({
                    status: 'success',
                    message: 'No existe el tipopago.'
                })
            }
            conn.close()
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
        try{
            var validate_tipo = !validator.isEmpty(params.tipo);
        }catch(err){
            conn.close()
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos.'
            })
        }

        if(validate_tipo){
            
            // Find and update
            TipoPago.findOneAndUpdate({_id: tipopagoId}, params, {new:true}, (err, tipopagoUpdated) => {
                if(err){
                    conn.close()
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar'
                    })
                }

                if(!tipopagoUpdated){
                    conn.close()
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el tipopago'
                    })
                }
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    tipopago: tipopagoUpdated
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
        var tipopagoId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        var TipoPago = conn.model('TipoPago', require('../schemas/tipoPago') )
        TipoPago.findOneAndDelete({_id: tipopagoId}, (err, tipopagoRemoved) => {
            if(!tipopagoRemoved){
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    message: 'No se pudo borrar el tipopago.'
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
                tipopagoRemoved
            })
        })

    }

}

module.exports = controller;