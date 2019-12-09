'use strict'

var validator = require('validator')
var Compra = require('../models/compra')
var CompraItem = require('../models/compra_item')
var Venta = require('../models/venta')
var VentaItem = require('../models/venta_item')
var Egreso = require('../models/egreso')

var controller = {
    save: (req, res) => {
        //recoger parametros
        var params = req.body;

        async function getNumberOfComprasFor(provedorId) {
            var res = await Compra.countDocuments({ provedor: provedorId })
            return res
        }
        Compra.estimatedDocumentCount((err, count) => {
            // .then((err, count) =>{
            if (err) console.log(err)
            const nDocuments = count
            var compra = new Compra();
            compra.folio = nDocuments + 1
            compra.provedor = params.provedor
            compra.ubicacion = params.ubicacion
            compra.tipoCompra = params.tipoCompra
            compra.remision = params.remision
            compra.importe = params.total
            compra.saldo = params.total
            compra.fecha = params.fecha
            compra.status = 'ACTIVO'

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
        Compra.find({ "status": { $ne: 'CERRADO', $ne: "LIQUIDADO" } }).sort('_id')
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
        Compra.find({}).sort('folio')
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

    getCompra: (req, res) => {
        var compraId = req.params.id;
        var data = {}
        Compra
        .findById(compraId)
        .populate('provedor', 'nombre tel1 cta1 email diasDeCredito comision')
        .populate('ubicacion')
        .populate('tipoCompra')
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

        Compra.findOneAndUpdate({_id: compraId}, {status: "5ddd89fdb47cdb22c669c374"} , (err, compraUpdated) => {
            if(err)console.log(err)
            return res.status(200).send({
                status: 'success',
                message: 'Actualizado correctamente',
                compraUpdated
            })
        })
    },

    update: (req, res) => {
        var compraId = req.params.id;

        //recoger datos actualizados y validarlos
        var params = req.body;
        try {
            var validate_clave = !validator.isEmpty(params.clave);
            var validate_descripcion = !validator.isEmpty(params.descripcion);
            var validate_costo = !validator.isEmpty(params.costo);
            var validate_precio1 = !validator.isEmpty(params.precio1);
        } catch (err) {
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos.'
            })
        }

        if (validate_clave && validate_descripcion && validate_costo, validate_precio1) {

            // Find and update
            Compra.findOneAndUpdate({ _id: compraId }, params, { new: true }, (err, compraUpdated) => {
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
                    compra: compraUpdated
                })

            })

        } else {
            return res.status(200).send({
                status: 'error',
                message: 'Datos no validos.'
            })
        }

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



}

module.exports = controller;