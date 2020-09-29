'use strict'
const con = require('../conections/hadriaUser')

var controller = {
    getInventario: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        var Compra = conn.model('Compra',require('../schemas/compra') )
        var Provedor = conn.model('Provedor',require('../schemas/provedor') )
        var Producto = conn.model('Producto',require('../schemas/producto') )
        var Ubicacion = conn.model('Ubicacion',require('../schemas/ubicacion') )
        var CompraItem = conn.model('CompraItem',require('../schemas/compra_item') )
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
            .sort('folio')
            .exec( (err, docs) => {
                mongoose.connection.close()
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
                    inventario: docs
                })
            })
    },
    
    getInventarioBy: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        var Compra = conn.model('Compra',require('../schemas/compra') )
        var ubicacion = req.params.ubicacion;
        Compra.find({ "ubicacion": ubicacion._id, "items.stock": {$gt: 0}})
            .select('clave items ubicacion')
            .populate('items.producto')
            .populate('ubicacion')
            .exec( (err, docs) => {
                mongoose.connection.close()
                conn.close()
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