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
                                compra.status = "5dc987a7c3ea92f940c0bbe4"
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
                        return res.status(200).send({
                            status: "success",
                            message: "Venta guardada correctamente."
                        })
                    })
                }        
            })
                       
        })
        
    },
    saveOld: (req, res) => {
        var errors = []
        //recoger parametros
        var params = req.body;
        
        // console.log(params)
        var venta = new Venta()
        var ingreso = new Ingreso()

        ingreso.importe = params.total

        venta.ubicacion = params.ubicacion
        venta.cliente = params.cliente
        venta.fecha = params.fecha
        venta.tipoPago = params.tipoPago
        venta.importe = params.total
        // venta.items = [];
        var items = params.items
        
        var ventaItems = []
        items.map((item) => {
            ventaItems.push({
                item: item.item,
                compra: item.compra,
                producto: item.producto._id,
                cantidad: item.cantidad,
                empaques: item.empaques,
                precio: item.precio,
                importe: item.importe,
            })
            // ACTUALIZAMOS STOCK
            Compra.findById(item.compra, (err, compra) => {
                if(err)console.log(err)
                compra.items.id(item.item).stock -= item.cantidad 
                compra.items.id(item.item).empaques -= item.empaques 
                compra.save((err, compra) => {
                    if(err) console.log(err)
                    let stockDisponible = 0
                    compra.items.forEach(el => {
                        stockDisponible += el.stock
                    });
                    if(stockDisponible === 0){
                        compra.status = "5dc987a7c3ea92f940c0bbe4"
                        compra.save()
                    }
                })
            })
            
            
        })
        VentaItem.insertMany(ventaItems)
        // venta.items = items

        if (params.tipoPago === 'CRÉDITO'){
            venta.acuenta = params.acuenta
            venta.saldo = params.saldo

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

            if(params.acuenta > 0){
                venta.pagos.push({
                    ubicacion: venta.ubicacion,
                    fecha: venta.fecha,
                    importe: params.acuenta
                })
            }

        }

        ingreso.ubicacion = params.ubicacion
        ingreso.fecha = params.fecha
        
        ingreso.concepto = "VENTA"
        ingreso.descripcion = "VENTA DESDE UBICACIÓN"
        ingreso.tipoPago = params.tipoPago

        ingreso.save((err, ing) =>{
            if(err)console.log(err)
            // console.log(ing)
        })


        venta.save((err, ventaStored) => {
            if(err || !ventaStored){
                return res.status(404).send({
                    status: 'error',
                    message: 'No se pudo guardar la venta: ',
                    error: err 
                })
            }
            return res.status(200).send({
                status: 'success',
                message: 'Venta registrada correctamente.'
            })
        })
        
    },

    getVentas: (req, res) => {
        Venta.find({}).exec((err, ventas) => {
            if(err)console.log(err)
            res.status(200).send({
                status: "success",
                ventas
            })
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

    delete: (req, res) => {
        var compraId = req.params.id;

        Compra.findOneAndDelete({_id: compraId}, (err, compraRemoved) => {
            if(!compraRemoved){
                return res.status(500).send({
                    status: 'error',
                    message: 'No se pudo borrar el compra.'
                })
            }
            if(err){
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