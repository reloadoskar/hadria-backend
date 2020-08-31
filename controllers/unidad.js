'use strict'
const con = require('../conections/hadriaUser')
// var Unidad = require('../models/unidad');

var controller = {
    save: (req, res) => {
        const bd= req.params.bd
        const conn = con(bd)
        var Unidad = conn.model('Unidad',require('../schemas/unidad') )
        //recoger parametros
        var params = req.body;

        //Crear el objeto a guardar
        var unidad = new Unidad();
            
        //Asignar valores
        unidad.unidad = params.unidad;
        unidad.abr = params.abr;

        //Guardar objeto
        unidad.save((err, unidadStored) => {
            if(err || !unidadStored){
                return res.status(404).send({
                    status: 'error',
                    message: 'La unidad no se guardó.',
                    err
                })
            }
            //Devolver respuesta
            return res.status(200).send({
                status: 'success',
                message: 'Unidad registrada correctamente.',
                unidad: unidadStored
            })
        })

    },

    getUnidades: (req, res) => {
        const bd= req.params.bd
        const conn = con(bd)
        var Unidad = conn.model('Unidad',require('../schemas/unidad') )
        Unidad.find({}).sort('_id').exec( (err, unidads) => {
            if(err || !unidads){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver las unidades'
                })
            }

            return res.status(200).send({
                status: 'success',
                unidads: unidads
            })
        })
    },

    delete: (req, res) => {
        const bd= req.params.bd
        const conn = con(bd)
        var Unidad = conn.model('Unidad',require('../schemas/unidad') )
        var unidadId = req.params.id;

        Unidad.findOneAndDelete({_id: unidadId}, (err, unidadRemoved) => {
            if(!unidadRemoved){
                return res.status(500).send({
                    status: 'error',
                    message: 'No se pudo borrar la unidad.'
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
                message: 'Unidad eliminada correctamente.',
                unidadRemoved
            })
        })

    }

}

module.exports = controller;