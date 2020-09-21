'use strict'
const con = require('../conections/hadriaUser')
// var Concepto = require('../models/concepto');

var controller = {
    save: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        var Concepto = conn.model('Concepto',require('../schemas/concepto') )
        //recoger parametros
        var params = req.body;

        //Crear el objeto a guardar
        var concepto = new Concepto();
            
        //Asignar valores
        concepto.concepto = params.concepto;

        //Guardar objeto
        concepto.save((err, conceptoStored) => {
            if(err || !conceptoStored){
                return res.status(404).send({
                    status: 'error',
                    message: 'El concepto no se guardó.',
                    err
                })
            }
            conn.close()
            //Devolver respuesta
            return res.status(200).send({
                status: 'success',
                message: 'Concepto registrado correctamente.',
                concepto: conceptoStored
            })
        })

    },

    getConceptos: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        var Concepto = conn.model('Concepto',require('../schemas/concepto') )
        Concepto.find({}).sort('concepto').exec( (err, conceptos) => {
            if(err || !conceptos){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los conceptos'
                })
            }
            conn.close()
            return res.status(200).send({
                status: 'success',
                conceptos: conceptos
            })
        })
    },

    delete: (req, res) => {
        var conceptoId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        var Concepto = conn.model('Concepto',require('../schemas/concepto') )

        Concepto.findOneAndDelete({_id: conceptoId}, (err, conceptoRemoved) => {
            if(!conceptoRemoved){
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    message: 'No se pudo borrar la concepto.'
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
                message: 'Concepto eliminado correctamente.',
                conceptoRemoved
            })
        })

    }

}

module.exports = controller;