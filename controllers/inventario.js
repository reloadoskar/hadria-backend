'use strict'
const con = require('../conections/hadriaUser')
const mongoose = require('mongoose')
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
    
    getInventarioBy: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        const ubicacion = req.params.ubicacion;
        const CompraItem = conn.model('CompraItem')
        console.log('CompraItem')
        CompraItem        
            .aggregate()
            .match({ubicacion: mongoose.Types.ObjectId(ubicacion), empaquesStock: { $gt: 0} })
            .lookup({ from: 'ubicacions', localField: "ubicacion", foreignField: '_id', as: 'ubicacion' })
            .lookup({ from: 'compras', localField: "compra", foreignField: '_id', as: 'compra' })
            .lookup({ from: 'productos', localField: "producto", foreignField: '_id', as: 'producto' })
            .lookup({ from: 'unidads', localField: "producto.unidad", foreignField: '_id', as: 'productounidad' })
            .lookup({ from: 'empaques', localField: "producto.empaque", foreignField: '_id', as: 'productoempaque' })
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
                "productounidad": 1,
                "productoempaque": 1,
            })
            .unwind('compra')
            .unwind('producto')
            .unwind('ubicacion')
            .unwind('productounidad')
            .unwind('productoempaque')
            // .group({
            //     _id: "$ubicacion",
            //     items: {$push: {_id: "$_id", compra: "$compra", producto: "$producto", stock: "$stock", empaquesStock: "$empaquesStock", empaques: "$empaques"}},
            // })
            
            .sort('_id.nombre')
            .then(inventario => {
                conn.close()
                return res.status(200).send({
                    status: "Encontrado",
                    inventario
                })
            })
            .catch(err => {
                conn.close()
                    return res.status(500).send({
                        status: "error",
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
                .lookup({ from: 'unidads', localField: "producto.unidad", foreignField: '_id', as: 'productounidad' })
                .lookup({ from: 'empaques', localField: "producto.empaque", foreignField: '_id', as: 'productoempaque' })
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
                    "productounidad": 1,
                    "productoempaque": 1,
                })
                .unwind('compra')
                .unwind('producto')
                .unwind('productounidad')
                .unwind('productoempaque')
                .group({
                    _id: "$ubicacion",
                    items: {$push: {
                        _id: "$_id", 
                        compra: "$compra", 
                        producto: "$producto", 
                        productounidad: "$productounidad", 
                        productoempaque: "$productoempaque", 
                        stock: "$stock", 
                        empaquesStock: "$empaquesStock", 
                        empaques: "$empaques"}},
                })
                .unwind('_id')
                .sort('_id.nombre')
                .then(inventario => {
                    conn.close()
                    return res.status(200).send({
                        status: "success",
                        message: "Encontrado",
                        inventario
                    })
                })
                .catch(err => {
                    conn.close()
                    return res.status(500).send({
                        status: "error",
                        err
                    })
                })

        } catch(err){
            console.error(err)
        }
    },

    // moveInventario: (req, res) => {
    //     const bd = req.params.bd
    //     const params = req.body;
    //     const destinoId = params.destino._id
    //     const compraId = params.itemsel.compra._id
    //     const productoId = params.itemsel.producto._id
    //     const cantidadm = parseInt(params.itemselcantidad)
    //     const empaquesm = parseInt(params.itemselempaques)
    //     const conn = con(bd)
    //     const CompraItem = conn.model('CompraItem')
    //     const Compra = conn.model('Compra')
    //     const Movimiento = conn.model('Movimiento')

    //     CompraItem.findById(params.itemsel._id).exec((err, item) => {
    //         if(err || !item){console.log(err)}
    //         item.cantidad -= params.itemselcantidad
    //         item.stock -= params.itemselcantidad
    //         item.empaques -= params.itemselempaques
    //         item.empaquesStock -= params.itemselempaques
    //         item.importe = item.cantidad * item.costo

    //         item.save((err, itemsaved) => {
    //             if(err){console.log(err)}
                
    //             let nitem = new CompraItem()
    //             nitem.ubicacion = params.destino._id
    //             nitem.compra = params.itemsel.compra._id
    //             nitem.producto = params.itemsel.producto._id
    //             nitem.cantidad = params.itemselcantidad
    //             nitem.stock = params.itemselcantidad
    //             nitem.empaques = params.itemselempaques
    //             nitem.empaquesStock = params.itemselempaques
    //             nitem.costo = itemsaved.costo
    //             nitem.importe = nitem.cantidad * itemsaved.costo
    //             nitem.save((err, nitemsaved) => {
    //                 if(err|!nitemsaved){console.log(err)}
    //                 Compra.findById(compraId).exec((err, compra) => {
    //                     if(err){console.log(err)}
    //                     compra.items.push(nitemsaved._id)
    //                     // console.log(compra)
    //                     let movimiento = new Movimiento()
    //                     movimiento.origen = params.origen
    //                     movimiento.destino = params.destino
    //                     movimiento.item = params.itemsel
    //                     movimiento.cantidad = params.itemselcantidad
    //                     movimiento.empaques = params.itemselempaques
    //                     movimiento.pesadas = params.pesadas
    //                     movimiento.save()
    //                     compra.movimientos.push(movimiento._id)
    //                     compra.save().then( compra => {
    //                         conn.close()
    //                         return res.status(200).send({
    //                             status: "success",
    //                             message: "Movimiento guardado correctamente.",
    //                             movimiento
    //                         })
    //                     })
    //                 })
    //             })
    //         })
    //     })
    // },


    moveInventario: (req, res) => {
        const bd = req.params.bd
        const params = req.body;
        const destinoId = params.destino._id
        const compraId = params.itemsel.compra._id
        const productoId = params.itemsel.producto._id
        const cantidadm = parseInt(params.itemselcantidad)
        const empaquesm = parseInt(params.itemselempaques)
        const conn = con(bd)
        const CompraItem = conn.model('CompraItem')
        const Compra = conn.model('Compra')
        const Movimiento = conn.model('Movimiento')


        const movimiento = new Movimiento()
            movimiento.origen = params.origen
            movimiento.destino = params.destino
            movimiento.item = params.itemsel
            movimiento.cantidad = params.itemselcantidad
            movimiento.empaques = params.itemselempaques
            movimiento.pesadas = params.pesadas
            movimiento.save((err, movimiento) => {
                if(err){
                    return res.status(500).send({
                        status: 'error',
                        message: "No se pudo guardar el movimiento.",
                        err
                    })
                }
                CompraItem.findById(params.itemsel._id).exec((err, item) => {
                    if(err || !item){
                        return res.status(500).send({
                            status: 'error',
                            message: "No se encontro el item origen.",
                            err
                        })
                    }
                    item.cantidad -= params.itemselcantidad
                    item.stock -= params.itemselcantidad
                    item.empaques -= params.itemselempaques
                    item.empaquesStock -= params.itemselempaques
                    item.importe = item.cantidad * item.costo
                    item.save((err, itemsaved) => {
                        if(err){
                            return res.status(500).send({
                                status: 'error',
                                message: "No se pudo actualizar el item origen"
                            })
                        }
                        const nitem = new CompraItem()
                        nitem.ubicacion = params.destino._id
                        nitem.compra = params.itemsel.compra._id
                        nitem.producto = params.itemsel.producto._id
                        nitem.cantidad = params.itemselcantidad
                        nitem.stock = params.itemselcantidad
                        nitem.empaques = params.itemselempaques
                        nitem.empaquesStock = params.itemselempaques
                        nitem.costo = itemsaved.costo
                        nitem.importe = nitem.cantidad * itemsaved.costo
                        nitem.save((err, nitemsaved) => {
                            if(err){
                                return res.status(500).send({
                                    status: 'error',
                                    message: "No se creó el nuevo item.",
                                    err
                                })
                            }
                            Compra.findById(compraId).exec((err, compra) => {
                                if(err){console.log(err)}
                                compra.items.push(nitemsaved._id)
                                compra.movimientos.push(movimiento._id)
                                compra.save((err, compra) => {
                                    conn.close()
                                    if(err){
                                        return res.status(500).send({
                                            status:"error",
                                            mesage: "No se actualizo la compra.",
                                            err
                                        })
                                    }
                                    return res.status(200).send({
                                        status:'success',
                                        movimiento
                                    })
                                })

                            })
                        })
                    })
                })
            })
    }
}

module.exports = controller;