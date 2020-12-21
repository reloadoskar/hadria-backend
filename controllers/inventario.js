'use strict'
const con = require('../conections/hadriaUser')
var mongoose = require('mongoose');
var controller = {
    getInventario: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        var Compra = conn.model('Compra',require('../schemas/compra') )
        var Produccion = conn.model('Produccion',require('../schemas/produccion') )
        var inventario = {}

        Compra.find({"status": "ACTIVO"})
            .select('clave folio ubicacion items importe')
            .populate({
                path: 'items',
                select: 'stock empaques cantidad costo empaquesStock producto',
                populate: {
                    path: 'producto',
                    select: 'descripcion unidad empaque',
                    populate: {
                        path: 'unidad empaque',
                        select: 'abr'
                    }
                }
            })
            .populate('ubicacion')
            .sort('folio')
            .exec()
            .then( inv => {
                inventario.compras = inv
                
                Produccion.find({"status": "ACTIVO" })
                .select('folio clave productos')
                .populate({
                    path: 'productos',
                    select: 'producto cantidad stock',
                    populate: {
                        path: 'producto',
                        select: 'descripcion'
                    }

                })
                .exec( (err, inv ) => {
                    inventario.produccion = inv
                        conn.close()
                        if (err){
                            return res.status(500).send({
                                status: 'error',
                                message: 'No se encontraron items',
                                err
                            })
                        }
                        return res.status(200).send({
                            status: 'success',
                            message: 'Items encontrados',
                            inventario
                        })
                } )
            })
    },
    
    getInventarioBy: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        var Compra = conn.model('Compra',require('../schemas/compra') )
        var ubicacion = req.params.ubicacion;
        Compra.find({ "ubicacion": ubicacion})
            .select('clave items ubicacion folio')
            .populate('ubicacion')
            .populate('items')
            .populate({
                path: 'items',
                populate: { 
                    path: 'producto',
                    populate: {
                        path: 'unidad empaque',
                        select: 'abr'
                    }
                },
            })
            .exec( (err, inventario) => {
                if (err || !inventario){
                    return res.status(500).send({
                        status: 'error',
                        message: 'No se encontraron items',
                    })
                }
                return res.status(200).send({
                    status: 'success',
                    message: 'Items encontrados',
                    inventario
                })
            })
    }
}

module.exports = controller;