'use strict'

var Compra = require('../models/compra');

var controller = {
    getInventario: (req, res) => {
        Compra.find({"status": "ACTIVO"})
            .select('clave ubicacion items.producto items.stock items.empaques items._id')
            .populate({
                path: 'items',
                select: 'cantidad stock empaques empaquesStock',
                populate: { path: "producto"}
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