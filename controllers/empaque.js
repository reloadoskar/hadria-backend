'use strict'
const con = require('../conections/hadriaUser')
// var Empaque = require('../models/empaque');

var controller = {    
    save: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        var Empaque = conn.model('Empaque',require('../schemas/empaque') )
        //recoger parametros
        var params = req.body;

        //Crear el objeto a guardar
        var empaque = new Empaque();
            
        //Asignar valores
        empaque.empaque = params.empaque;
        empaque.abr = params.abr;

        //Guardar objeto
        empaque.save((err, empaqueStored) => {
            if(err || !empaqueStored){
                conn.close()
                return res.status(404).send({
                    status: 'error',
                    message: 'El empaque no se guardó.',
                    err
                })
            }
            //Devolver respuesta
            conn.close()
            return res.status(200).send({
                status: 'success',
                message: 'Empaque registrado correctamente.',
                empaque: empaqueStored
            })
        })

    },

    getEmpaques: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        var Empaque = conn.model('Empaque',require('../schemas/empaque') )
        Empaque.find({}).sort('_id').exec( (err, empaques) => {
            if(err || !empaques){
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los empaques'
                })
            }
            conn.close()
            return res.status(200).send({
                status: 'success',
                empaques: empaques
            })
        })
    },

    delete: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        var Empaque = conn.model('Empaque',require('../schemas/empaque') )
        var empaqueId = req.params.id;

        Empaque.findOneAndDelete({_id: empaqueId}, (err, empaqueRemoved) => {
            if(!empaqueRemoved){
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    message: 'No se pudo borrar la empaque.'
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
                message: 'Empaque eliminada correctamente.',
                empaqueRemoved
            })
        })

    }

}

module.exports = controller;