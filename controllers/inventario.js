'use strict'
const con = require('../conections/hadriaUser')
var controller = {
    getInventario: async (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        const Compra = conn.model('Compra')

        const resp = await Compra
            .find({"status": "ACTIVO"})
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
            .lean()
            .then( inv => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    message: 'Items encontrados',
                    inventario: inv
                })
                
            })
            .catch(err => {
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    message: "No se encontraron items.",
                    err
                })
            })
    },
    
    getInventarioBy: async (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        const ubicacion = req.params.ubicacion;
        const Compra = conn.model('Compra')
        const resp = await Compra
            .find({ "ubicacion": ubicacion})
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
            .lean()
            .then( inventario => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    message: 'Items encontrados',
                    inventario
                })
            })
            .catch(err => {
                return res.status(500).send({
                    status: 'error',
                    message: 'No se encontraron items',
                    err
                })
            })
    },

    getInventarioUbicacion: async (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        const CompraItem = conn.model('CompraItem')
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
        const destinoId = params.destino._id
        const compraId = params.itemsel.compra[0]._id
        const productoId = params.itemsel.producto[0]._id
        const cantidadm = parseInt(params.itemselcantidad)
        const empaquesm = parseInt(params.itemselempaques)
        const conn = con(bd)
        const CompraItem = conn.model('CompraItem')
        const Compra = conn.model('Compra')
        const Movimiento = conn.model('Movimiento')

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
                
                let nitem = new CompraItem()
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
                        // console.log(compra)
                        let movimiento = new Movimiento()
                        movimiento.origen = params.origen
                        movimiento.destino = params.destino
                        movimiento.item = params.itemsel
                        movimiento.cantidad = params.itemselcantidad
                        movimiento.empaques = params.itemselempaques
                        movimiento.pesadas = params.pesadas
                        movimiento.save()
                        compra.movimientos.push(movimiento._id)
                        compra.save()
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