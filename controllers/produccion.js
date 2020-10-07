'use strict'
var mongoose = require('mongoose');
const con = require('../conections/hadriaUser')

var controller = {
    save: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        var Produccion = conn.model('Produccion',require('../schemas/produccion') )
        //Crear el objeto a guardar

        Produccion.estimatedDocumentCount((err, count) => {
            if (err) console.log(err)
            const nDocuments = count

            var produccion = new Produccion();

            produccion.fecha = new Date()
            produccion.folio = nDocuments + 1
            produccion.clave = "PRO-"+produccion.folio
            produccion.status = "ACTIVO"
            produccion.costo = 0
            produccion.valor = 0

            //Guardar objeto
            produccion.save((err, produccionStored) => {
                mongoose.connection.close()
                conn.close()
                if (err || !produccionStored) {
                    return res.status(200).send({
                        status: 'error',
                        message: 'La produccion no se creó'
                    })
                }
                return res.status(200).send({
                    status: 'success',
                    message: 'Producción creada correctamente.',
                    produccion: produccionStored
                })
            })


        })
    },

    getProduccions: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        var Produccion = conn.model('Produccion',require('../schemas/produccion') )
        Produccion.find({})
            .populate('insumos')
            .populate({
                path:'insumos', 
                populate: {
                    path: 'compraItem',
                    populate: 'producto'
                }
            })
            .sort('folio')
            .exec((err, produccions) => {
                conn.close()
                mongoose.connection.close()
                if (err || !produccions) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al devolver los produccions'
                    })
                }
                return res.status(200).send({
                    status: 'success',
                    produccions: produccions
                })
        })
    },

    getProduccion: (req, res) => {
        var produccionId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        var Produccion = conn.model('Produccion',require('../schemas/produccion') )
        if (!produccionId) {
            mongoose.connection.close()
            conn.close()
            return res.status(404).send({
                status: 'error',
                message: 'No existe la producción: ',
                produccionId
            })
        }

        Produccion.findById(produccionId)
        .populate('insumos')
        .populate('egresos')
        .populate('items')
        .populate('ventas')
        .exec( (err, produccion) => {
            mongoose.connection.close()
            conn.close()
            if (err || !produccion) {
                return res.status(404).send({
                    status: 'success',
                    message: 'Ocurrio un error.',
                    err
                })
            }
            return res.status(200).send({
                status: 'success',
                produccion
            })
        })
    },

    update: (req, res) => {
        var produccionId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        var Produccion = conn.model('Produccion',require('../schemas/produccion') )
        //recoger datos actualizados y validarlos
        var params = req.body;
        try {
            var validate_clave = !validator.isEmpty(params.clave);
            var validate_descripcion = !validator.isEmpty(params.descripcion);
            var validate_costo = !validator.isEmpty(params.costo);
            var validate_precio1 = !validator.isEmpty(params.precio1);
        } catch (err) {
            conn.close()
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos.'
            })
        }

        if (validate_clave && validate_descripcion && validate_costo, validate_precio1) {

            // Find and update
            Produccion.findOneAndUpdate({ _id: produccionId }, params, { new: true }, (err, produccionUpdated) => {
                mongoose.connection.close()
                conn.close()
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar'
                    })
                }

                if (!produccionUpdated) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el produccion'
                    })
                }
                return res.status(200).send({
                    status: 'success',
                    produccion: produccionUpdated
                })

            })

        } else {
            mongoose.connection.close()
            conn.close()
            return res.status(200).send({
                status: 'error',
                message: 'Datos no validos.'
            })
        }

    },

    delete: (req, res) => {
        var produccionId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        var Produccion = conn.model('Produccion',require('../schemas/produccion') )
        Produccion.findOneAndDelete({ _id: produccionId }, (err, produccionRemoved) => {
            mongoose.connection.close()
            conn.close()
            if (!produccionRemoved) {
                return res.status(500).send({
                    status: 'error',
                    message: 'No se pudo borrar el produccion.'
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
                message: 'Produccion eliminado correctamente.',
                produccionRemoved
            })
        })

    }

}

module.exports = controller;