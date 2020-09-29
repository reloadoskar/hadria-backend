'use strict'
var mongoose = require('mongoose');
const con = require('../conections/hadriaUser')

var controller = {
    save: (req, res) => {
        //recoger parametros
        var params = req.body;
        const bd = req.params.bd
        const conn = con(bd)
        var Egreso = conn.model('Egreso',require('../schemas/egreso') )
        var Ingreso = conn.model('Ingreso',require('../schemas/ingreso') )
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
                    conn.close()
                    return res.status(404).send({
                        status: 'error',
                        message: 'No se registró el egreso.' + err
                    })
                }
                var ingreso = new Ingreso()
                ingreso.ubicacion = params.ubicacionReceptora
                ingreso.concepto = "RECEPCION"
                ingreso.descripcion = params.descripcion
                ingreso.fecha = params.fecha
                ingreso.importe = params.importe
                ingreso.save((err, ingresoSaved) => {
                    mongoose.connection.close()
                    conn.close()
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
        const bd = req.params.bd
        const conn = con(bd)
        var Egreso = conn.model('Egreso',require('../schemas/egreso') )
        var Ingreso = conn.model('Egreso',require('../schemas/ingreso') )
        Ingreso.findOneAndDelete({_id: ingresoId}, (err, ingresoRemoved) => {
            mongoose.connection.close()
            conn.close()
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