'use strict'
const con = require('../conections/hadriaUser')
var controller = {
    getInventario: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        var Compra = conn.model('Compra', require("../schemas/compra"))

        Compra.find({"status": "ACTIVO"})
            .select('clave folio ubicacion items importe')
            .populate({
                path: 'items',
                select: 'stock empaques cantidad costo empaquesStock producto, ubicacion',
                populate: {
                    path: 'producto ubicacion',
                    select: 'nombre descripcion unidad empaque',
                    populate: {
                        path: 'unidad empaque',
                        select: 'abr'
                    }
                }
            })
            .populate('items.ubicacion')
            .populate({path: 'provedor', select: "nombre clave"})
            .populate('ubicacion')
            .sort('folio')
            .exec((err,inv) => {
                conn.close()
                if (err){
                    console.log(err)
                }
                return res.status(200).send({
                    status: 'success',
                    message: 'Items encontrados',
                    inventario: inv
                })
            })
    },
    
    getInventarioBy: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        var Compra = conn.model('Compra', require('../schemas/compra'))
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
    },

    getInventarioUbicacion: async (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        const CompraItem = conn.model('CompraItem', require('../schemas/compra_item'))
        try{
            const inventario = await CompraItem.aggregate()
                .match({stock: {$gt: 0}})
                .lookup({ from: 'ubicacions', localField: "ubicacion", foreignField: '_id', as: 'ubicacion' })
                .lookup({ from: 'compras', localField: "compra", foreignField: '_id', as: 'compra' })
                .lookup({ from: 'productos', localField: "producto", foreignField: '_id', as: 'producto' })
                .project({
                    _id: 1,
                    stock: 1,
                    empaques: 1,
                    empaquesStock: 1,
                    ubicacion: 1, 
                    "compra._id":1,
                    "compra.folio": 1, 
                    "compra.clave": 1, 
                    "compra.status": 1,
                    "producto._id": 1,
                    "producto.descripcion": 1,
                })
                .group({
                    _id: "$ubicacion",
                    items: {$push: {_id: "$_id", compra: "$compra", producto: "$producto", stock: "$stock", empaquesStock: "$empaquesStock", empaques: "$empaques"}},
                })
                .exec()
                return res.status(200).send({
                    status: "success",
                    message: "Encontrado",
                    inventario
                })

        } catch(err){
            console.error(err)
        }
    },

    moveInventario: (req, res) => {
        const bd = req.params.bd
        const params = req.body;
        var destinoId = params.destino._id
        var compraId = params.itemsel.compra[0]._id
        var productoId = params.itemsel.producto[0]._id
        var cantidadm = parseInt(params.itemselcantidad)
        var empaquesm = parseInt(params.itemselempaques)

        console.log("cantm")
        console.log(cantidadm)
        const conn = con(bd)
        const CompraItem = conn.model('CompraItem')
        const Compra = conn.model('Compra')
        CompraItem.findById(params.itemsel._id).exec((err, item) => {
            if(err || !item){console.log(err)}
            item.cantidad -= params.itemselcantidad
            item.stock -= params.itemselcantidad
            item.empaques -= params.itemselempaques
            item.empaquesStock -= params.itemselempaques
            item.importe = item.cantidad * item.costo

            // console.log("ITEM ORIGINAL UPD")
            // console.log(item)
            item.save((err, itemsaved) => {
                if(err){console.log(err)}
                
                var nitem = new CompraItem()
                nitem.ubicacion = params.destino._id
                nitem.compra = params.itemsel.compra[0]._id
                nitem.producto = params.itemsel.producto[0]._id
                nitem.cantidad = params.itemselcantidad
                nitem.stock = params.itemselcantidad
                nitem.empaques = params.itemselempaques
                nitem.empaquesStock = params.itemselempaques
                nitem.costo = itemsaved.costo
                nitem.importe = nitem.cantidad * itemsaved.costo
                nitem.save((err, nitemsaved) => {
                    if(err|!nitemsaved){console.log(err)}
                    Compra.findById(compraId).exec((err, compra) => {
                        if(err){console.log(err)}
                        compra.items.push(nitemsaved._id)
                        compra.save()
                        console.log(compra)
                    })
                })

            })
        })
        return res.status(200).send({
            status: "success",
            message: "Movimiento guardado correctamente.",
            params
        })
    }
}

module.exports = controller;