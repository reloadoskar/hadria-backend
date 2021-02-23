'use strict'
var mongoose = require('mongoose');
const con = require('../conections/hadriaUser')
var validator = require('validator');

var controller = {
    save: (req, res) => {
        //recoger parametros
        const params = req.body;
        const bd = req.params.bd
        const conn = con(bd)
        const Provedor = conn.model('Provedor')
        
        let provedor = new Provedor();
            
            //Asignar valores
            provedor.nombre = params.nombre;
            provedor.clave = params.clave;
            provedor.direccion = params.direccion;
            provedor.tel1 = params.tel1;
            provedor.cta1 = params.cta1;
            provedor.email = params.email;
            provedor.diasDeCredito = params.diasDeCredito;
            provedor.comision = params.comision;

            //Guardar objeto
            provedor.save((err, provedorStored) => {
                conn.close()
                if(err || !provedorStored){
                    return res.status(404).send({
                        status: 'error',
                        message: 'El provedor no se guardó' + err
                    })
                }
                return res.status(200).send({
                    status: 'success',
                    message: 'Productor guardado correctamente.',
                    provedor: provedorStored
                })
            })
    },

    getProvedors: async (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        const Provedor = conn.model('Provedor')
        const resp = await Provedor
            .find({})
            .sort('clave')
            .lean()
            .then(provedors => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    provedors: provedors
                })
            })
            .catch(err => {
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los provedores',
                    err
                })
            })
    },

    getProvedor: async (req, res) => {
        const provedorId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        const Provedor = conn.model('Provedor')
        if(!provedorId){
            mongoose.connection.close()
            conn.close()
            return res.status(404).send({
                status: 'error',
                message: 'No existe el provedor'
            })
        }

        const resp = await Provedor
            .findById(provedorId)
            .lean()
            .then(provedor => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    provedor
                })
            })
            .catch(err => {
                conn.close()
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el provedor.',
                    err
                })
           })
    },

    update: (req, res) => {
        var provedorId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        var Provedor = conn.model('Provedor',require('../schemas/provedor') )
        //recoger datos actualizados y validarlos
        var params = req.body;
        try{
            var validate_nombre = !validator.isEmpty(params.nombre);
            var validate_clave = !validator.isEmpty(params.clave);
            var validate_direccion = !validator.isEmpty(params.direccion);
            var validate_tel1 = !validator.isEmpty(params.tel1);
            var validate_cta1 = !validator.isEmpty(params.cta1);
            var validate_dias = !validator.isEmpty(params.dias_de_credito);
            var validate_comision = !validator.isEmpty(params.comision);
        }catch(err){
            mongoose.connection.close()
            conn.close()
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos.'
            })
        }

        if(validate_nombre && validate_direccion && validate_tel1 && validate_clave && validate_cta1 && validate_dias && validate_comision){
            
            // Find and update
            Provedor.findOneAndUpdate({_id: provedorId}, params, {new:true}, (err, provedorUpdated) => {
                mongoose.connection.close()
                conn.close()
                if(err){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar'
                    })
                }

                if(!provedorUpdated){
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el provedor'
                    })
                }
                return res.status(200).send({
                    status: 'success',
                    provedor: provedorUpdated
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
        var provedorId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        var Provedor = conn.model('Provedor',require('../schemas/provedor') )
        Provedor.findOneAndDelete({_id: provedorId}, (err, provedorRemoved) => {
            mongoose.connection.close()
            conn.close()
            if(!provedorRemoved){
                return res.status(500).send({
                    status: 'error',
                    message: 'No se pudo borrar el provedor.'
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
                message: 'El Proveedor se eliminó correctamente',
                provedorRemoved
            })
        })

    }

}

module.exports = controller;