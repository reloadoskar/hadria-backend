'use strict'
var mongoose = require('mongoose');
const con = require('../conections/hadriaUser')
var validator = require('validator');

var controller = {
    save: (req, res) => {
        //recoger parametros
        var params = req.body;
        const bd = req.params.bd
        const conn = con(bd)
        var Provedor = conn.model('Provedor',require('../schemas/provedor') )
        //validar datos
        try{
            var validate_nombre = !validator.isEmpty(params.nombre);
            var validate_clave = !validator.isEmpty(params.clave);
            var validate_direccion = !validator.isEmpty(params.direccion);
            var validate_tel1 = !validator.isEmpty(params.tel1);
            var validate_cta1 = !validator.isEmpty(params.cta1);
            //var validate_dias = !validator.isEmpty(params.diasDeCredito).toString();
            // var validate_comision = !validator.isEmpty(params.comision);
        }catch(err){
            mongoose.connection.close()
            conn.close()
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos: '+err
            })
        }

        if(validate_nombre && validate_direccion && validate_tel1 && validate_clave && validate_cta1 ){
            //Crear el objeto a guardar
            var provedor = new Provedor();
            
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
                mongoose.connection.close()
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


        }else{
            mongoose.connection.close()
            conn.close()
            return res.status(200).send({
                status: 'error',
                message: 'Datos no validos.'
            })
        }

    },

    getProvedors: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        var Provedor = conn.model('Provedor',require('../schemas/provedor') )
        Provedor.find({}).sort('clave').exec( (err, provedors) => {
            mongoose.connection.close()
            conn.close()
            if(err || !provedors){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los provedores'
                })
            }
            return res.status(200).send({
                status: 'success',
                provedors: provedors
            })
        })
    },

    getProvedor: (req, res) => {
        var provedorId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        var Provedor = conn.model('Provedor',require('../schemas/provedor') )
        if(!provedorId){
            mongoose.connection.close()
            conn.close()
            return res.status(404).send({
                status: 'error',
                message: 'No existe el provedor'
            })
        }

        Provedor.findById(provedorId, (err, provedor) => {
            mongoose.connection.close()
            conn.close()
            if(err || !provedor){
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el provedor.'
                })
            }
            return res.status(200).send({
                status: 'success',
                provedor
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