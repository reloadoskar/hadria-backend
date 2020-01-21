'use strict'
var mongoose = require('mongoose');
var Compra = require('../models/compra')
var CompraItem = require('../models/compra_item')
var VentaItem = require('../models/venta_item')
var Egreso = require('../models/egreso')
var Produccion = require('../models/produccion')

var controller = {
    save: (req, res) => {
        //recoger parametros
        var params = req.body;

        // async function getNumberOfComprasFor(provedorId) {
        //     var res = await Compra.countDocuments({ provedor: provedorId })
        //     return res
        // }
        Compra.estimatedDocumentCount((err, count) => {
            // .then((err, count) =>{
            if (err) console.log(err)
            const nDocuments = count
            var compra = new Compra();
            compra._id = mongoose.Types.ObjectId(),
            compra.folio = nDocuments + 1
            compra.provedor = params.provedor
            compra.ubicacion = params.ubicacion
            compra.tipoCompra = params.tipoCompra
            compra.remision = params.remision
            compra.importe = params.total
            compra.saldo = params.total
            compra.fecha = params.fecha
            compra.status = 'ACTIVO'

            if (params.tipoCompra.tipo === "PRODUCCION" ){
                compra.produccion = params.produccion
                compra.status = 'PRODUCCION'
                Produccion.findById(params.produccion._id).exec((err, produccion) => {
                    produccion.compras.push(compra.id)
                    produccion.costo += compra.importe
                    produccion.save()
                })
            }

            compra.save((err, compraSaved) => {
                if (err) {
                    return res.status(200).send({
                        status: 'error',
                        message: "No se pudo guardar la compra.",
                        err
                    })
                } else {
                    //Calculamos cuantas compras tiene el provedor... then()...
                    Compra.countDocuments({ provedor: params.provedor._id })
                        .then(c => {
                            var sigCompra = c
                            compraSaved.clave = params.provedor.clave + "-" + sigCompra
                            var i = params.items
                            var itmsToSave = []
                            i.map((item) => {
                                var compraItem = {}
                                if(item.provedor === ''){
                                    compraItem.provedor = compra.provedor
                                }else{
                                    compraItem.provedor = item.provedor
                                }
                                compraItem.compra = compraSaved._id
                                compraItem.producto = item.producto._id
                                compraItem.cantidad = item.cantidad
                                compraItem.stock = item.cantidad
                                compraItem.empaques = item.empaques
                                compraItem.empaquesStock = item.empaques
                                compraItem.costo = item.costo
                                compraItem.importe = item.importe
                                itmsToSave.push(compraItem)
                            })
                            CompraItem.insertMany(itmsToSave, (err, items) => {
                                if (err) console.log(err)
                                items.map(itm => {
                                    compraSaved.items.push(itm._id)
                                })
                                compraSaved.save((err, compra) => {
                                    if(err)console.log(err)
                                    //Devolver respuesta
                                    Compra.findById(compra._id)
                                        .populate('provedor', 'nombre')
                                        .populate('ubicacion')
                                        .populate('tipoCompra')
                                        .populate({
                                            path: 'items',
                                            populate: { path: 'producto'},
                                        })
                                        .exec((err, compraCompleta) => {
                                            if (err || !compraCompleta) {
                                                return res.status(500).send({
                                                    status: 'error',
                                                    message: 'Error al devolver la compra' + err
                                                })
                                            }

                                            return res.status(200).send({
                                                status: 'success',
                                                message: 'Compra registrada correctamente.',
                                                compra: compraCompleta
                                            })
                                        })
                                })
                            });


                        })

                }
            })
        })
    },

    getComprasDash: (req, res) => {
        Compra.find({ "status": { $ne: "PRODUCCION" }, "status": { $ne: "CANCELADO"} }).sort('folio')
            .populate('provedor', 'nombre')
            .populate('ubicacion')
            .populate('tipoCompra')
            .populate({
                path: 'items',
                populate: { path: 'producto'},
            })
            .exec((err, compras) => {
                if (err || !compras) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al devolver los compras' + err
                    })
                }
    
                return res.status(200).send({
    
                    status: 'success',
                    compras: compras
                })
    
            })
    },

    getCompras: (req, res) => {
        Compra.find({
            $and:[
                {"status": {$ne: "CANCELADO"} }, 
                {"status": {$ne: "CERRADO"} },
                {"status": {$ne: "PRODUCCION"} },
                ]
        }).sort('folio')
            .populate('provedor', 'nombre')
            .populate('ubicacion')
            .populate('tipoCompra')
            .populate({
                path: 'items',
                populate: { path: 'producto'},
            })
            .populate({
                path: 'items',
                populate: { path: 'provedor'},
            })
            .exec((err, compras) => {
                if (err || !compras) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al devolver los compras' + err
                    })
                }

                return res.status(200).send({

                    status: 'success',
                    compras: compras
                })

            })
    },

    getCompra: (req, res) => {
        var compraId = req.params.id;
        var data = {}
        Compra
        .findById(compraId)
        .populate('provedor', 'clave nombre tel1 cta1 email diasDeCredito comision')
        .populate('ubicacion')
        .populate('tipoCompra')
        .populate({
            path: 'items',
            populate: { path: 'provedor'},
        })
        .populate({
            path: 'items',
            populate: { path: 'producto'},
        })
        .populate({
            path: 'items',
            populate: { path: 'producto', populate: { path: 'unidad'} },
        })
        .populate({
            path: 'items',
            populate: { path: 'producto', populate: { path: 'empaque'} },
        })
        .populate('pagos.ubicacion')
        .exec()
        .then( (compra) => {
            
            data.compra = compra
                
                
            return VentaItem.find({compra: compra._id})
                .populate('venta')
                .populate('producto')
                .exec()

        })
        .then((ventas) => {
            data.ventas = ventas
            return VentaItem
                .aggregate()
                .match({compra: data.compra._id})
                .group({_id: {producto: "$producto", precio: "$precio"}, cantidad: { $sum: "$cantidad" }, empaques: { $sum: "$empaques" }, importe: { $sum: "$importe" } })
                .lookup({ from: 'productos', localField: "_id.producto", foreignField: '_id', as: 'producto' })
                .sort({"_id.producto": 1, "_id.precio": -1})
                .exec()

        })
        .then(ventasGroup => {
            data.ventasGroup = ventasGroup        
                return Egreso.find({compra: data.compra._id, concepto: {$ne: 'PAGO'}})
                    .populate('ubicacion')
                    .exec()
        })
        .then( egresos => {
                data.egresos = egresos
                return res.status(200).send({
                    status: 'success',
                    data
                })

        })
    },

    close: (req, res) => {
        var compraId = req.params.id

        Compra.findOneAndUpdate({_id: compraId}, {status: "CERRADO"} , (err, compraUpdated) => {
            if(err)console.log(err)
            return res.status(200).send({
                status: 'success',
                message: 'Compra cerrada correctamente.',
                compraUpdated
            })
        })
    },

    update: (req, res) => {
        var compra = req.body

            Compra.findByIdAndUpdate(compra._id, compra, { new: true }, (err, compraUpdated) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar'
                    })
                }

                if (!compraUpdated) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el compra'
                    })
                }

                return res.status(200).send({
                    status: 'success',
                    message: "Compra actualizada",
                    compra: compraUpdated
                })

            })

    },

    delete: (req, res) => {
        var compraId = req.params.id;

        Compra.findOneAndDelete({ _id: compraId }, (err, compraRemoved) => {
            if (!compraRemoved) {
                return res.status(500).send({
                    status: 'error',
                    message: 'No se pudo borrar el compra.'
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
                message: 'Compra eliminada correctamente',
                compraRemoved
            })
        })

    },

    cancel: (req, res) => {
        var compraId = req.params.id

        Compra.findById(compraId).exec((err, compra) => {
            compra.status = "CANCELADO"

            compra.save((err, saved) => {
                if(err | !saved){
                    return res.status(200).send({
                        status: 'error',
                        message: 'Ocurrió un error',
                        err
                    })
                }else{
                    CompraItem.updateMany({"compra": saved._id}, {"stock": 0}, (err, n) => {
                        return res.status(200).send({
                            status: 'success',
                            message: 'Compra CANCELADA correctamente.',
                            saved
                        })
                    })
                }
            })
        })
    },

    addCompraItem: (req,res) => {
        var item = req.body
        var newItem = new CompraItem()
        newItem.compra = item.compra
        newItem.producto = item.producto
        newItem.cantidad = item.cantidad
        newItem.stock = item.stock
        newItem.empaques = item.empaques
        newItem.empaquesStock = item.stock
        newItem.costo = item.costo
        newItem.importe = item.importe

        newItem.save((err, itmSaved) => {
            if(err || !itmSaved) {
                return res.status(200).send({
                    status: 'error',
                    message: 'Ocurrio un error.'
                })
            }else{
                Compra.findById(newItem.compra).exec((err,compra) => {
                    if(err){
                        return res.status(200).send({
                            status: 'error',
                            message: 'Ocurrio un error.'
                        })      
                    }else{
                        compra.items.push(itmSaved._id)
                        compra.save()
                        CompraItem.findById(itmSaved._id).populate('producto').exec((err, item)=> {
                            return res.status(200).send({
                                status: 'success',
                                message: 'Item Agregado correctamente.',
                                item: item
                            })

                        })
                    }
                })
            }
        })

    },

    updateCompraItem: (req, res) => {
        var item = req.body;

        CompraItem.findById(item.item_id).exec( (err, compraItem) => {
            if(err || !compraItem){
                return res.status(200).send({
                    status: 'error',
                    message: 'Ocurrio un error.'
                })
            }else{
                let cantDiff = compraItem.cantidad - item.cantidad
                let empDiff = compraItem.empaques - item.empaques
                compraItem.cantidad = item.cantidad
                compraItem.empaques = item.empaques
                compraItem.costo = item.costo
                compraItem.importe = item.importe
                compraItem.stock -= cantDiff
                compraItem.empaquesStock -= empDiff
                compraItem.save((err, compraItemSaved) => {
                    if(err || !compraItemSaved){
                        return res.status(200).send({
                            status: 'error',
                            message: 'Algo pasó al actualizar.',
                            err
                        })
                    }else{
                        return res.status(200).send({
                            status: 'success',
                            message: 'Item actualizado.'
                        })
                    }
                })
            }
        })
    }



}

module.exports = controller;