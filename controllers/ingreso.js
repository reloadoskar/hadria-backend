'use strict'

var validator = require('validator');
var Ingreso = require('../models/ingreso');
var Cuenta = require('../models/porCobrarCuenta');
var Compra = require('../models/compra')

var controller = {
    save: (req, res) => {
        //recoger parametros
        var params = req.body;
        
        var ingreso = new Ingreso()

        ingreso.ubicacion = params.ubicacion
        ingreso.concepto = params.concepto
        ingreso.descripcion = params.descripcion
        ingreso.fecha = params.fecha
        ingreso.importe = params.importe

        if(ingreso.concepto === "PRESTAMO"){
            Compra.estimatedDocumentCount((err, count) => {
                const nDocuments = count
                var compra = new Compra()
                compra._id = mongoose.Types.ObjectId(),
                compra.folio = nDocuments + 1
                compra.provedor = params.provedor
                compra.ubicacion = params.ubicacion
                compra.tipoCompra = "PRESTAMO"
                compra.importe = params.importe
                compra.saldo = params.importe
                compra.fecha = params.fecha
                compra.status = 'ACTIVO'
                compra.save()
            })

        }

        ingreso.save((err, ingresoSaved) => {
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: "No se pudo registrar el Ingreso."
                })
            }

            return res.status(200).send({
                status: 'success',
                message: "Ingreso registrado correctamente.",
                ingreso: ingresoSaved
            })

        })
    },

    getIngresos: (req, res) => {
        Ingreso.find({}).sort('-_id')
            .populate('provedor', 'nombre')
            .populate('ubicacion')
            .populate('items.producto')
            .exec( (err, ingresos) => {
            if(err || !ingresos){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los ingresos' + err
                })
            }

            return res.status(200).send({
                status: 'success',
                ingresos
            })
        })
    },

    getIngreso: (req, res) => {
        var ingresoId = req.params.id;

        if(!ingresoId){
            return res.status(404).send({
                status: 'error',
                message: 'No existe el ingreso'
            })
        }

        Ingreso.findById(ingresoId, (err, ingreso) => {
            if(err || !ingreso){
                return res.status(404).send({
                    status: 'success',
                    message: 'No existe el ingreso.'
                })
            }
            return res.status(200).send({
                status: 'success',
                ingreso
            })
        })
    },

    update: (req, res) => {
        var ingresoId = req.params.id;
        
        //recoger datos actualizados y validarlos
        var params = req.body;
        try{
            var validate_clave = !validator.isEmpty(params.clave);
            var validate_descripcion = !validator.isEmpty(params.descripcion);
            var validate_costo = !validator.isEmpty(params.costo);
            var validate_precio1 = !validator.isEmpty(params.precio1);
        }catch(err){
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos.'
            })
        }

        if(validate_clave && validate_descripcion && validate_costo, validate_precio1){
            
            // Find and update
            Ingreso.findOneAndUpdate({_id: ingresoId}, params, {new:true}, (err, ingresoUpdated) => {
                if(err){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar'
                    })
                }

                if(!ingresoUpdated){
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el ingreso'
                    })
                }

                return res.status(200).send({
                    status: 'success',
                    ingreso: ingresoUpdated
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
        var ingresoId = req.params.id;

        Ingreso.findOneAndDelete({_id: ingresoId}, (err, ingresoRemoved) => {
            if(!ingresoRemoved){
                return res.status(500).send({
                    status: 'error',
                    message: 'No se pudo borrar el ingreso.'
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
                ingresoRemoved
            })
        })

    }

}

module.exports = controller;