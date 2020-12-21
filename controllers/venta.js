'use strict'
var mongoose = require('mongoose');
const con = require('../conections/hadriaUser')

var controller = {
    save: (req, res) => {
        const bd = req.params.bd
        const params = req.body
        const conn = con(bd)

        var Ingreso = conn.model('Ingreso')
        var Venta = conn.model('Venta')
        var VentaItem = conn.model('VentaItem')
        var CompraItem = conn.model('CompraItem')
        var Cliente = conn.model('Cliente')

        var ingreso = new Ingreso()
        var venta = new Venta()

        ingreso.concepto = "VENTA"
        ingreso.venta = venta._id
        ingreso.ubicacion = params.ubicacion
        ingreso.fecha = params.fecha
        ingreso.tipoPago = params.tipoPago
        if(params.tipoPago === "CRÉDITO"){
            if(params.acuenta>0){
                venta.acuenta = params.acuenta
                ingreso.importe = params.acuenta
                ingreso.saldo = params.saldo
            }else{
                venta.acuenta = 0
                ingreso.importe = 0
                ingreso.saldo = params.total
            }

            Cliente.findById(params.cliente._id).exec((err, cliente)=>{
                if(err){console.log(err)}
                cliente.cuentas.push(ingreso._id)
                let creditoDisponible = cliente.credito_disponible
                let creditoActualizado = creditoDisponible - ingreso.saldo
                cliente.credito_disponible = creditoActualizado
                cliente.save(err => {
                    if(err)console.log(err)
                })
            })


        }else{
            ingreso.importe = params.total
        }

        ingreso.save((err, ingresoSaved) => {
            if(err || !ingresoSaved){console.log(err)}
        })


        Venta.estimatedDocumentCount((err, count) => {
            if(err){console.log(err)}
            venta.folio = count +1
            venta.ubicacion = params.ubicacion
            venta.cliente = params.cliente
            venta.fecha = params.fecha
            venta.importe = params.total
            venta.tipoPago = params.tipoPago
            
            var items = params.items

            items.map(item => {
                var ventaItem = new VentaItem()
                    ventaItem.venta = venta._id
                    ventaItem.ventaFolio = venta.folio 
                    ventaItem.ubicacion = venta.ubicacion
                    ventaItem.fecha = venta.fecha
                    ventaItem.compra = item.compra
                    ventaItem.compraItem = item.item
                    ventaItem.producto = item.producto._id
                    ventaItem.cantidad = item.cantidad
                    ventaItem.empaques = item.empaques
                    ventaItem.precio = item.precio
                    ventaItem.importe = item.importe

                    ventaItem.save((err, vItmSaved)=>{
                        if(err)console.log(err)
                    })

                    venta.items.push(ventaItem._id)

                    CompraItem.updateOne({_id: item.item },
                        {"$inc": { "stock":  -item.cantidad, "empaquesStock": -item.empaques }},
                        (err, doc) => {
                            if(err)console.log(err)
                        }
                    )
            })

            venta.save((err, ventaSaved) => {
                if(err){console.log(err)}
                return res.status(200).send({
                    status: "success",
                    message: "Venta guardada correctamente.",
                    venta: ventaSaved
                })
            })
        })


    },
    // save: (req, res) => {
    //     const bd= req.params.bd
    //     const conn = con(bd)
    //     var Venta = conn.model('Venta')
    //     var Cliente = conn.model('Cliente')
    //     var VentaItem = conn.model('VentaItem')
    //     var Compra = conn.model('Compra')
    //     var CompraItem = conn.model('CompraItem')
    //     var Ingreso = conn.model('Ingreso')
        
    //     var params = req.body
    //     var venta = new Venta()
    //     var ingreso = new Ingreso()
    //     ingreso._id = mongoose.Types.ObjectId()
    //     Venta.estimatedDocumentCount((err, count) => {
    //         venta._id = mongoose.Types.ObjectId(),
    //         venta.folio = count + 1
    //         venta.ubicacion = params.ubicacion
    //         venta.cliente = params.cliente
    //         venta.fecha = params.fecha
    //         venta.tipoPago = params.tipoPago
    //         venta.importe = params.total 

    //         ingreso.importe = params.total
    //         ingreso.concepto = "VENTA"
            
    //         var items = params.items
    //         var ventaItems = []

    //         if (params.tipoPago === 'CRÉDITO'){
    //             ingreso.acuenta = params.acuenta
    //             ingreso.saldo = params.saldo
    //             ingreso.descripcion = "PAGO A CUENTA DE: "+ params.cliente.nombre + " FOLIO: "+ venta.folio
    //             ingreso.importe = params.acuenta
    
    //             Cliente.findById(params.cliente._id, (err, cliente) => {
    //                 if(err)console.log(err)
    //                 cliente.cuentas.push(ingreso._id)
    //                 let creditoDisponible = cliente.credito_disponible
    //                 let creditoActualizado = creditoDisponible - venta.saldo
    
    //                 cliente.credito_disponible = creditoActualizado
    //                 cliente.save((err, cliente) => {
    //                     if(err)console.log(err)
    //                 })
    //             })
    //         }

            
    //         items.map((item) => {
    //             var newItem = {
    //             // ventaItems.push({
    //                 _id: mongoose.Types.ObjectId(),
    //                 venta: venta._id,
    //                 ventaFolio: venta.folio,   
    //                 ubicacion: venta.ubicacion,
    //                 fecha:venta.fecha,                 
    //                 compra: item.compra,
    //                 compraItem: item.item,
    //                 producto: item.producto._id,
    //                 cantidad: item.cantidad,
    //                 empaques: item.empaques,
    //                 precio: item.precio,
    //                 importe: item.importe,
    //             }

    //             venta.items.push(newItem._id)
    //             ventaItems.push(newItem)

    //             CompraItem.updateOne({_id: item.item },
    //                 {"$inc": { "stock":  -item.cantidad, "empaquesStock": -item.empaques }},
    //              (err, doc) => {
    //                 if(err)console.log(err)
    //                 // console.log(doc)
    //                 if(doc.ok > 0){
    //                     // console.log("Item actualizado", doc)
    //                     Compra.findById(item.compra)
    //                     .populate('items')
    //                     .populate('tipoCompra')
    //                     .exec( (err, compra) => {
    //                         if(err)console.log(err)
    //                         // console.log(compra)
    //                         if(compra.tipoCompra.tipo === 'CONSIGNACION'){
    //                             let calc = item.importe - (item.importe * .10)
    //                             compra.saldo += calc
    //                         }
    //                         let stockDisponible = 0
    //                         compra.items.forEach(el => {
    //                             // console.log(el)
    //                             stockDisponible += el.stock
    //                         });
    //                         if(stockDisponible === 0){
    //                             compra.status = "TERMINADO"
    //                         }
    //                         compra.save()
    //                     })
    //                 }else{
    //                     mongoose.connection.close()
    //                     conn.close()
    //                     console.log("Ocurrió algo, y no se actualizó el item :(")
    //                 }
    //             })


                
    //         })

    //         VentaItem.insertMany(ventaItems, (err, itemsSaved) =>{
    //             if(err)console.log(err)
    //         })

    //         venta.save( (err, ventaSaved) => {
    //             if(err){
    //                 return res.status(404).send({
    //                     status: "error",
    //                     message: "Error al guardar la venta",
    //                     err
    //                 })
    //             }
    //             else{
    //                 ingreso.venta = ventaSaved._id
    //                 ingreso.ubicacion = params.ubicacion
    //                 ingreso.fecha = params.fecha        
                    
    //                 ingreso.tipoPago = params.tipoPago
    //                 ingreso.save((err, ing) =>{
    //                     if(err)console.log(err)




    //                     Venta.findById(ventaSaved._id)
    //                         .populate('ubicacion')
    //                         .populate('cliente')
    //                         .populate({
    //                             path: 'items',
    //                             populate: { path: 'producto'},
    //                         })
    //                         .populate({
    //                             path: 'items',
    //                             populate: { path: 'compra'},
    //                         })
    //                         .populate({
    //                             path: 'pagos',
    //                             populate: { path: 'ubicacion'},
    //                         })
    //                         .exec((err, venta) => {
    //                             mongoose.connection.close()
    //                             conn.close()
    //                             if(err)console.log(err)
    //                             return res.status(200).send({
    //                                 status: "success",
    //                                 message: "Venta guardada correctamente.",
    //                                 venta: venta
    //                         })
    //                     })
    //                 })
    //             }        
    //         })
                       
    //     })
        
    // },

    getVentas: (req, res) => {
        const bd= req.params.bd
        const conn = con(bd)
        var Venta = conn.model('Venta',require('../schemas/venta') )
        Venta.find({})
        .populate('compras')
        .exec((err, ventas) => {
            mongoose.connection.close()
            conn.close()
            if(err)console.log(err)
            return res.status(200).send({
                status: "success",
                ventas
            })
        })
    },

    getVenta: (req, res) => {
        var folio = req.body.folio
        const bd= req.params.bd
        const conn = con(bd)
        var Venta = conn.model('Venta',require('../schemas/venta') )
        Venta.find({"folio": folio })
        .populate({
            path: 'items',
            populate: { path: 'producto'},
        })
        .populate({
            path: 'items',
            populate: { path: 'compra'},
        })
        .populate('pagos.ubicacion')
        .populate('ubicacion')
        .populate('cliente')
        .exec((err, venta) => {
            mongoose.connection.close()
            conn.close()
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
        const bd= req.params.bd
        const conn = con(bd)
        var Venta = conn.model('Venta',require('../schemas/venta') )
        Venta.aggregate()
            .project({"items": 1, fecha: 1, cliente: 1, tipoPago:1, })
            // .sort("items.item")
            .match({"items.item": productId})
            .exec((err, ventas) => {
                mongoose.connection.close()
                conn.close()
                if(err)console.log(err)
                res.status(200).send({
                    status: "success",
                    ventas
                })
            })
    },

    getVentasSemana: (req, res) => {
        var fecha1 = req.query.f1
        var fecha2 = req.query.f2
        const bd= req.params.bd
        const conn = con(bd)
        var Venta = conn.model('Venta',require('../schemas/venta') )
        Venta.aggregate([
            { $match: { fecha: { $gte: fecha1, $lte: fecha2 } } },
            { $group: 
                { 
                    _id: "$fecha" ,                
                    totalVenta: { $sum: "$importe" } ,
                } 
            },
            { $sort: {_id: 1 } }
        ]).exec((err, ventas) => {
            mongoose.connection.close()
            conn.close()
            if(err)console.log(err)
                res.status(200).send({
                    status: "success",
                    ventas
                })
        })
    },

    update: (req, res) => {
        var compraId = req.params.id;
        const bd= req.params.bd
        const conn = con(bd)
        var Venta = conn.model('Venta',require('../schemas/venta') )
        //recoger datos actualizados y validarlos
        var params = req.body;
            
            // Find and update
            Compra.findOneAndUpdate({_id: compraId}, params, {new:true}, (err, compraUpdated) => {
                mongoose.connection.close()
                conn.close()
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

    },

    cancel: (req, res) => {
        var id = req.params.id;
        const bd= req.params.bd
        const conn = con(bd)
        var Venta = conn.model('Venta',require('../schemas/venta') )
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
                            conn.close()
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
                    mongoose.connection.close()
                    conn.close()
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