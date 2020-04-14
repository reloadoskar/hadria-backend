'use strict'

var Ingreso = require('../models/ingreso');
var Egreso = require('../models/egreso')

var controller = {
    save: (req, res) => {
        //recoger parametros
        var params = req.body;
        
        var egreso = new Egreso()
        Egreso.estimatedDocumentCount((err, count) => {
            egreso.folio = ++count
            egreso.ubicacion = params.ubicacion
            egreso.concepto = "RETIRO"
            egreso.descripcion = params.descripcion
            egreso.fecha = params.fecha
            egreso.importe = params.importe
            egreso.save((err, egreso) => {
                if( err || !egreso){
                    return res.status(404).send({
                        status: 'error',
                        message: 'No se registró el egreso.' + err
                    })
                }
                var ingreso = new Ingreso()
                ingreso.ubicacion = params.ubicacion
                ingreso.concepto = "RECEPCION"
                ingreso.descripcion = params.descripcion
                ingreso.fecha = params.fecha
                ingreso.importe = params.importe
                ingreso.save((err, ingresoSaved) => {
                    if(err){
                        return res.status(500).send({
                            status: 'error',
                            message: "No se pudo registrar el Ingreso."
                        })
                    }
        
                    return res.status(200).send({
                        status: 'success',
                        message: "Retiro registrado correctamente.",
                        ingreso: ingresoSaved
                    })
        
                })
                
            })
        })



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