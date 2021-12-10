'use strict'
const mongoose = require('mongoose');

const con = require('../conections/hadriaUser')

var controller = {
    save: (req, res) => {
        const params = req.body;
        const bd = req.params.bd
        const conn = con(bd)
        const Inversion = conn.model( 'Inversion')
        
        Inversion.estimatedDocumentCount().then(count => {
            var inversion = new Inversion();
            inversion._id = mongoose.Types.ObjectId()
            inversion.folio = count + 1

            inversion.provedor = params.productor
            inversion.descripcion = params.descripcion
            inversion.fecha = params.fecha
            inversion.status = 'ACTIVO'
            inversion.save(function(error){
                if(error){

                }
                inversion
                    .populate('provedor', 'nombre')
                    .execPopulate()
                    .then((err, inv) => {
                        conn.close()  
                        return res.status(200).send({
                            status: 'success',
                            message: 'Inversion registrada correctamente.',
                            inversion,
                        })
                            
                    })

            })
        })
    
    },

    getInversions: async (req, res) => {
        const bd = req.params.bd
        let mes = req.params.mes
        // mes++
        if(mes<10){
            mes = "0"+ mes
        }
        const conn = con(bd)
        const Inversion = conn.model('Inversion')
         
        const resp = await Inversion
            .find({
                fecha: {$gt: "2021-"+mes+"-00" , $lt: "2021-"+mes+"-32"}
            })
            .sort('_id')
            .lean()
            .populate('provedor', 'nombre diasDeCredito comision email cta1 tel1')
            .populate('compras')            
            .populate('gastos')
            .populate({
                path: 'gastos',
                populate: { path: 'ubicacion'},
            })
            .then(inversiones => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    inversions: inversiones
                })
            })
            .catch(err => {
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver las inversiones' + err
                })
            })
    },

    getInversion: async (req, res) => {
        const Id = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        const Inversion = conn.model('Inversion')

        let data = {}

        conn.close()
        return res.status(200).send({
            status: 'success',
            data
        })
    },

    open: async (req, res) => {
        const Id = req.params.id
        const bd = req.params.bd
        const conn = con(bd)
        const Inversion = conn.model('Inversion')
        const resp = await Inversion
            .findOneAndUpdate({_id: Id}, {status: "ACTIVO"} )
            .then(inv => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    message: 'Inversion activada correctamente.',
                    inversion: inv
                })
            })
            .catch(err => {
                conn.close()
                return res.status(404).send({
                    status: "error",
                    err
                })
            })
    },

    close: async (req, res) => {
        const Id = req.params.id
        const bd = req.params.bd
        const conn = con(bd)
        const Inversion = conn.model('Inversion')
        const resp = await Inversion
            .findOneAndUpdate({_id: Id}, {status: "CERRADO"} )
            .then(inv => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    message: 'Inversion cerrada correctamente.',
                    inversion: inv
                })
            })
            .catch(err => {
                conn.close()
                return res.status(404).send({
                    status: "error",
                    err
                })
            })
    },

    update: async (req, res) => {
        const Id = req.params.id
        const bd = req.params.bd
        const conn = con(bd)
        
    },

    delete: (req, res) => {
        const Id = req.params.id
        const bd = req.params.bd
        const conn = con(bd)
        const Inversion = conn.model('Inversion')
        Inversion.findOneAndDelete({ _id: Id }, (err, invRemoved) => {
            conn.close()
            if (!invRemoved) {
                return res.status(500).send({
                    status: 'error',
                    message: 'No se pudo eliminar.'
                })
            }
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Ocurrio un error.'
                })
            }
            return res.status(200).send({
                status: 'success',
                message: 'Inversion eliminada correctamente',
                inversion: invRemoved
            })
        })

    },

    cancel: (req, res) => {
        const Id = req.params.id
        const bd = req.params.bd
        const conn = con(bd)
        const Inversion = conn.model('Inversion')
        Inversion.findById(Id).exec((err, inversion) => {
            inversion.status = "CANCELADO"

            inversion.save((err, saved) => {
                if(err | !saved){
                    conn.close()
                    return res.status(200).send({
                        status: 'error',
                        message: 'Ocurrió un error',
                        err
                    })
                }
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    message: 'Compra CANCELADA correctamente.',
                    saved
                })
            })
        })
    },
}

module.exports = controller;