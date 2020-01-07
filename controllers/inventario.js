'use strict'

var Compra = require('../models/compra');

var controller = {
    getInventario: (req, res) => {
        Compra.find({"status": "ACTIVO"})
            .select('clave folio ubicacion items')
            .populate({
                path: 'items',
                select: 'stock empaques cantidad, empaquesStock producto provedor',
                populate: {
                    path: "producto",
                    select: "descripcion precio1"
                }, 
            })
            .populate({
                path: 'items',
                populate: {
                    path: 'provedor',
                    select: "clave "
                }
            })
            .populate({
                path: 'ubicacion',
                select: 'nombre'
            })
            .exec( (err, docs) => {
                if (err){
                    return res.status(500).send({
                        status: 'error',
                        message: 'No se encontraron items',
                    })
                }

                return res.status(200).send({
                    status: 'success',
                    message: 'Items encontrados',
                    inventario: docs
                })
            })
    },
    
    getInventarioBy: (req, res) => {
        var ubicacion = req.params.ubicacion;
        Compra.find({ "ubicacion": ubicacion._id, "items.stock": {$gt: 0}})
            .select('clave items ubicacion')
            .populate('items.producto')
            .populate('ubicacion')
            .exec( (err, docs) => {
                if (err){
                    return res.status(500).send({
                        status: 'error',
                        message: 'No se encontraron items',
                    })
                }

                return res.status(200).send({
                    status: 'success',
                    message: 'Items encontrados',
                    inventario: docs
                })
            })
    }
}

module.exports = controller;