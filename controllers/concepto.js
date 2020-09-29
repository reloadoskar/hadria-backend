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
            mongoose.connection.close()
            conn.close()
            if(err || !conceptoStored){
                return res.status(404).send({
                    status: 'error',
                    message: 'El concepto no se guardó.',
                    err
                })
            }
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
            conn.close()
            mongoose.connection.close()
            if(err || !conceptos){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los conceptos'
                })
            }
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
            mongoose.connection.close()
            conn.close()
            if(!conceptoRemoved){
                return res.status(500).send({
                    status: 'error',
                    message: 'No se pudo borrar la concepto.'
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
                message: 'Concepto eliminado correctamente.',
                conceptoRemoved
            })
        })

    }

}

module.exports = controller;