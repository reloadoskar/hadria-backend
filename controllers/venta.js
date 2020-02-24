'use strict'

var validator = require('validator');
var Compra = require('../models/compra');
var Venta = require('../models/venta');
var CompraItem = require('../models/compra_item');
var VentaItem = require('../models/venta_item');
var Cliente = require('../models/cliente');
var Ingreso = require('../models/ingreso');

var mongoose = require('mongoose');

var controller = {
    save: (req, res) => {
        var params = req.body
        var venta = new Venta()
        var ingreso = new Ingreso()
        Venta.estimatedDocumentCount((err, count) => {
            venta._id = mongoose.Types.ObjectId(),
            venta.folio = ++count
            venta.ubicacion = params.ubicacion
            venta.cliente = params.cliente
            venta.fecha = params.fecha
            venta.tipoPago = params.tipoPago
            venta.importe = params.total 
            // venta.status = "ACTIVO"
            ingreso.importe = params.total

            if (params.tipoPago === 'CRÉDITO'){
                venta.acuenta = params.acuenta
                venta.saldo = params.saldo
                
                if(params.acuenta > 0){
                    venta.pagos.push({
                        ubicacion: params.ubicacion,
                        fecha: params.fecha,
                        importe: params.acuenta
                    })
                }
    
                ingreso.importe = params.acuenta
    
                Cliente.findById(params.cliente._id, (err, cliente) => {
                    if(err)console.log(err)
                    let creditoDisponible = cliente.credito_disponible
                    let creditoActualizado = creditoDisponible - venta.saldo
    
                    cliente.credito_disponible = creditoActualizado
                    cliente.save((err, cliente) => {
                        if(err)console.log(err)
                    })
                })
            }

            var items = params.items
            var ventaItems = []
            
            items.map((item) => {
                var newItem = {
                // ventaItems.push({
                    _id: mongoose.Types.ObjectId(),
                    venta: venta._id,
                    ventaFolio: venta.folio,                    
                    compra: item.compra,
                    compraItem: item.item,
                    producto: item.producto._id,
                    cantidad: item.cantidad,
                    empaques: item.empaques,
                    precio: item.precio,
                    importe: item.importe,
                }

                venta.items.push(newItem._id)
                ventaItems.push(newItem)

                CompraItem.updateOne({_id: item.item },
                    {"$inc": { "stock":  -item.cantidad, "empaquesStock": -item.empaques }},
                 (err, doc) => {
                    if(err)console.log(err)
                    // console.log(doc)
                    if(doc.ok > 0){
                        // console.log("Item actualizado", doc)
                        Compra.findById(item.compra)
                        .populate('items')
                        .populate('tipoCompra')
                        .exec( (err, compra) => {
                            if(err)console.log(err)
                            // console.log(compra)
                            if(compra.tipoCompra.tipo === 'CONSIGNACION'){
                                let calc = params.total - (params.total * .10)
                                compra.saldo += calc
                            }
                            let stockDisponible = 0
                            compra.items.forEach(el => {
                                // console.log(el)
                                stockDisponible += el.stock
                            });
                            if(stockDisponible === 0){
                                compra.status = "TERMINADO"
                            }
                            compra.save()
                        })
                    }else{
                        console.log("Ocurrió algo, y no se actualizó el item :(")
                    }
                })


                
            })

            VentaItem.insertMany(ventaItems, (err, itemsSaved) =>{
                if(err)console.log(err)
            })

            venta.save( (err, ventaSaved) => {
                if(err){
                    return res.status(404).send({
                        status: "error",
                        message: "Error al guardar la venta",
                        err
                    })
                }
                else{
                    ingreso.venta = ventaSaved._id
                    ingreso.ubicacion = params.ubicacion
                    ingreso.fecha = params.fecha        
                    ingreso.concepto = "VENTA"
                    ingreso.tipoPago = params.tipoPago
                    ingreso.save((err, ing) =>{
                        if(err)console.log(err)
                        Venta.findById(ventaSaved._id)
                            .populate('ubicacion')
                            .populate('cliente')
                            .populate({
                                path: 'items',
                                populate: { path: 'producto'},
                            })
                            .populate({
                                path: 'items',
                                populate: { path: 'compra'},
                            })
                            .populate({
                                path: 'pagos',
                                populate: { path: 'ubicacion'},
                            })
                            .exec((err, venta) => {
                                if(err)console.log(err)
                                return res.status(200).send({
                                    status: "success",
                                    message: "Venta guardada correctamente.",
                                    venta: venta
                            })
                        })
                    })
                }        
            })
                       
        })
        
    },

    getVentas: (req, res) => {
        Venta.find({})
        .populate('compras')
        .exec((err, ventas) => {
            if(err)console.log(err)
            res.status(200).send({
                status: "success",
                ventas
            })
        })
    },

    getVenta: (req, res) => {
        var folio = req.body.folio
        Venta.find({"folio": folio })
        .populate({
            path: 'items',
            populate: { path: 'producto'},
        })
        .populate({
            path: 'items',
            populate: { path: 'compra'},
        })
        .populate('ubicacion')
        .populate('cliente')
        .exec((err, venta) => {
            if(err){
                return res.status(500).send({
                    status: "error",
                    err
                })
            }
            else{
                return res.status(200).send({
                    status: "success",
                    venta
                })
            }
        })
    },

    getVentasOfProduct: (req, res) => {
        var productId = req.params.id;
        Venta.aggregate()
            .project({"items": 1, fecha: 1, cliente: 1, tipoPago:1, })
            // .sort("items.item")
            .match({"items.item": productId})
            .exec((err, ventas) => {
                if(err)console.log(err)
                res.status(200).send({
                    status: "success",
                    ventas
                })
            })
    },


    update: (req, res) => {
        var compraId = req.params.id;
        
        //recoger datos actualizados y validarlos
        var params = req.body;
        try{
            var validate_clave = !validator.isEmpty(params.clave);
            var validate_descripcion = !validator.isEmpty(params.descripcion);
            var validate_costo = !validator.isEmpty(params.costo);
            var validate_precio1 = !validator.isEmpty(params.precio1);
        }catch(err){
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos.'
            })
        }

        if(validate_clave && validate_descripcion && validate_costo, validate_precio1){
            
            // Find and update
            Compra.findOneAndUpdate({_id: compraId}, params, {new:true}, (err, compraUpdated) => {
                if(err){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar'
                    })
                }

                if(!compraUpdated){
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

        }else{
            return res.status(200).send({
                status: 'error',
                message: 'Datos no validos.'
            })
        }

    },

    cancel: (req, res) => {
        var id = req.params.id;

        Venta.findById(id)
            .populate({
                path: 'items',
                populate: { path: 'compraItem'},
            })
            .exec((err, venta) => {
                if(!venta){
                    return res.status(500).send({
                        status: 'error',
                        message: 'No se encontró la venta.'
                    })
                }
                if(err){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Ocurrio un error.'
                    })
                }


                venta.tipoPago = "CANCELADO"
                venta.saldo = 0
                venta.importe = 0

                venta.items.map(item => {
                    let stockUpdated = item.compraItem.stock + item.cantidad
                    let empUpdated = item.compraItem.stock + item.empaques
                    CompraItem.findById(item.compraItem._id).exec((err, item) => {
                        if(err || !item){
                            return res.status(500).send({
                                status: 'error',
                                message: 'No encontré el item.'
                            })
                        }
                        else{
                            item.stock = stockUpdated
                            item.empaquesStock = empUpdated

                            item.save( (err, itemSaved) => {
                                if(err)console.log(err)
                            })
                            
                        }
                    })
                })

                VentaItem.deleteMany({"venta": venta._id}, err => {
                    if(err)console.log(err)
                })
                
                Ingreso.deleteMany({"venta": venta._id}, err => {
                    if(err)console.log(err)
                })
                
                venta.save((err, ventaSaved) => {
                    if(err || !ventaSaved){
                        return res.status(200).send({
                            status: 'error',
                            message: 'No se actualizo la venta.',
                        })
                    }
                    else{
                        return res.status(200).send({
                            status: 'success',
                            message: 'Venta cancelada correctamente',
                            venta
                        })
                    }
                })

        })

    },

    

}

module.exports = controller;