'use strict'
var mongoose = require('mongoose');
const con = require('../conections/hadriaUser')

var controller = {
    save: (req, res) => {
        var params = req.body;
        const bd = req.params.bd
        const conn = con(bd)
        var Compra = conn.model('Compra', require('../schemas/compra') )
        var CompraItem = conn.model('CompraItem', require('../schemas/compra_item') )
        var Egreso = conn.model('Egreso', require('../schemas/egreso') )
        var Provedor = conn.model('Provedor', require('../schemas/provedor'))
        Compra.estimatedDocumentCount((err, count) => {
            if (err) console.log(err)
            const nDocuments = count
            var compra = new Compra();
            compra._id = mongoose.Types.ObjectId()
            compra.folio = nDocuments + 1
            compra.provedor = params.provedor
            compra.ubicacion = params.ubicacion
            compra.tipoCompra = params.tipoCompra
            compra.remision = params.remision
            compra.importe = params.importe
            compra.saldo = params.importe
            compra.fecha = params.fecha
            compra.status = 'ACTIVO'

            Provedor.findById(compra.provedor).exec((err, prov)=>{
                if(err){console.log(err)}
                // prov.cuentas.push(compra._id)
                // prov.save()


            Compra.countDocuments({ provedor: params.provedor._id })
            .then(c => {
                var sigCompra = c +1
                compra.clave = params.provedor.clave + "-" + sigCompra
                
                var i = params.items
                var itmsToSave = []
                i.map((item) => {
                    var compraItem = {}
                    compraItem._id = mongoose.Types.ObjectId()
                    compraItem.ubicacion = params.ubicacion
                    compraItem.compra = compra._id
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
                        compra.items.push(itm._id)
                    })
                    
                    Egreso.estimatedDocumentCount().then( c => {
                        var g = params.gastos
                        var cgastos = []
                        g.map((gasto) => {
                            var egreso = new Egreso()
                            egreso._id = mongoose.Types.ObjectId()
                            egreso.folio = c + 1
                            egreso.tipo = "COMPRA"
                            egreso.ubicacion = compra.ubicacion
                            egreso.concepto = gasto.concepto
                            egreso.descripcion = gasto.descripcion
                            egreso.fecha = compra.fecha
                            egreso.importe = 0
                            egreso.saldo = gasto.importe
                            egreso.compra = compra._id
                            compra.gastos.push(egreso._id)
                            prov.cuentas.push(egreso._id)
                            egreso.save((err, e)=> {
                                if(err){console.log(err)}
                            })
                        })
                        // compra.gastos.push(cgastos)
                        compra.save((err, compraSaved) => {          
                                                                  
                            if (err || !compraSaved) {
                                return res.status(500).send({
                                    status: 'error',
                                    message: 'Error al devolver la compra' + err
                                })
                            }
                            Egreso.estimatedDocumentCount().then( c => {
                                var egItm = new Egreso()
                                egItm._id = mongoose.Types.ObjectId()
                                egItm.folio = c + 1
                                egItm.tipo = "COMPRA"
                                egItm.ubicacion = compra.ubicacion
                                egItm.concepto = "COMPRA"
                                egItm.fecha = compra.fecha
                                egItm.importe = 0
                                egItm.saldo = params.importeItems
                                egItm.compra = compra._id
                                prov.cuentas.push(egItm._id)
                                egItm.save((err, e) => {
                                    if(err){console.log(err)}
                                })
                                
                                prov.save()
                            })

                            Compra.findById(compraSaved._id)
                            .sort('folio')
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
                            .exec((err, c) => {
                                conn.close()  
                                console.log(err)
                                return res.status(200).send({
                                    status: 'success',
                                    message: 'Compra registrada correctamente.',
                                    compra: c,
                                })
                            })
                        })
                    })

                })
            })
        })
    })
    },

    // save: (req, res) => {
    //     //recoger parametros
    //     var params = req.body;
    //     const bd = req.params.bd
    //     const conn = con(bd)
    //     var Compra = conn.model('Compra', require('../schemas/compra') )
    //     var CompraItem = conn.model('CompraItem', require('../schemas/compra_item') )
    //     Compra.estimatedDocumentCount((err, count) => {
    //         // .then((err, count) =>{
    //         if (err) console.log(err)
    //         const nDocuments = count
    //         var compra = new Compra();
    //         compra._id = mongoose.Types.ObjectId(),
    //         compra.folio = nDocuments + 1
    //         compra.provedor = params.provedor
    //         compra.ubicacion = params.ubicacion
    //         compra.tipoCompra = params.tipoCompra
    //         compra.remision = params.remision
    //         compra.importe = params.importe
    //         compra.saldo = params.importe
    //         compra.fecha = params.fecha
    //         compra.status = 'ACTIVO'

    //         compra.save((err, compraSaved) => {
    //             if (err) {
    //                 return res.status(200).send({
    //                     status: 'error',
    //                     message: "No se pudo guardar la compra.",
    //                     err
    //                 })
    //             } else {
    //                 //Calculamos cuantas compras tiene el provedor... then()...
    //                 Compra.countDocuments({ provedor: params.provedor._id })
    //                     .then(c => {
    //                         var sigCompra = c
    //                         compraSaved.clave = params.provedor.clave + "-" + sigCompra
    //                         var i = params.items
    //                         var itmsToSave = []
    //                         i.map((item) => {
    //                             var compraItem = {}
    //                             if(item.provedor === ''){
    //                                 compraItem.provedor = compra.provedor
    //                             }else{
    //                                 compraItem.provedor = item.provedor
    //                             }
    //                             compraItem.compra = compraSaved._id
    //                             compraItem.producto = item.producto._id
    //                             compraItem.cantidad = item.cantidad
    //                             compraItem.stock = item.cantidad
    //                             compraItem.empaques = item.empaques
    //                             compraItem.empaquesStock = item.empaques
    //                             compraItem.costo = item.costo
    //                             compraItem.importe = item.importe
    //                             itmsToSave.push(compraItem)
    //                         })
    //                         CompraItem.insertMany(itmsToSave, (err, items) => {
    //                             if (err) console.log(err)
    //                             items.map(itm => {
    //                                 compraSaved.items.push(itm._id)
    //                             })
    //                             compraSaved.save((err, compra) => {
    //                                 if(err)console.log(err)
    //                                 //Devolver respuesta
    //                                 Compra.findById(compra._id)
    //                                     .populate('provedor', 'nombre')
    //                                     .populate('ubicacion')
    //                                     .populate('tipoCompra')
    //                                     .populate({
    //                                         path: 'items',
    //                                         populate: { path: 'producto'},
    //                                     })
    //                                     .exec((err, compraCompleta) => {
    //                                         conn.close()
    //                                         mongoose.connection.close()
    //                                         if (err || !compraCompleta) {
    //                                             return res.status(500).send({
    //                                                 status: 'error',
    //                                                 message: 'Error al devolver la compra' + err
    //                                             })
    //                                         }
    //                                         return res.status(200).send({
    //                                             status: 'success',
    //                                             message: 'Compra registrada correctamente.',
    //                                             compra: compraCompleta
    //                                         })
    //                                     })
    //                             })
    //                         });


    //                     })

    //             }
    //         })
    //     })
    // },

    getComprasDash: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)

        var Compra = conn.model('Compra', require('../schemas/compra') )
        
        Compra.find({ "status": { $ne: "PRODUCCION" }, "status": { $ne: "CANCELADO"} }).sort('folio')
            .populate('provedor', 'nombre')
            .populate('ubicacion')
            .populate('tipoCompra')
            .populate({
                path: 'items',
                populate: { path: 'producto'},
            })
            .exec((err, compras) => {
                conn.close()
                mongoose.connection.close()
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
        const bd = req.params.bd
        const conn = con(bd)
        var Compra = conn.model('Compra', require('../schemas/compra') )
        var CompraItem = conn.model('CompraItem', require('../schemas/compra_item') )
        var TipoCompra = conn.model('TipoCompra', require('../schemas/tipoCompra') )
        var Provedor = conn.model('Provedor', require('../schemas/provedor') )
        var Producto = conn.model('Producto', require('../schemas/producto') )
        var Ubicacion = conn.model('Ubicacion', require('../schemas/ubicacion') )

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
                conn.close()
                mongoose.connection.close()
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
        const bd = req.params.bd
        const conn = con(bd)
        var Compra = conn.model('Compra', require('../schemas/compra') )
        var VentaItem = conn.model('VentaItem', require('../schemas/venta_item') )
        var Egreso = conn.model('Egreso', require('../schemas/egreso') )
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
                return Egreso.find({compra: data.compra._id, tipo: {$eq: 'GASTO DE COMPRA'}})
                    .populate('ubicacion')
                    .exec()
        })
        .then( egresos => {
            mongoose.connection.close()
            conn.close()
                data.egresos = egresos
                return res.status(200).send({
                    status: 'success',
                    data
                })

        })
    },

    close: (req, res) => {
        var compraId = req.params.id
        const bd = req.params.bd
        const conn = con(bd)
        var Compra = conn.model('Compra', require('../schemas/compra') )
        Compra.findOneAndUpdate({_id: compraId}, {status: "CERRADO"} , (err, compraUpdated) => {
            if(err)console.log(err)
            conn.close()
            mongoose.connection.close()
            return res.status(200).send({
                status: 'success',
                message: 'Compra cerrada correctamente.',
                compraUpdated
            })
        })
    },

    update: (req, res) => {
        var compra = req.body
        const bd = req.params.bd
        const conn = con(bd)
        var Compra = conn.model('Compra', require('../schemas/compra') )
            Compra.findByIdAndUpdate(compra._id, compra, { new: true }, (err, compraUpdated) => {
                conn.close()
                mongoose.connection.close()
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
        const bd = req.params.bd
        const conn = con(bd)
        var Compra = conn.model('Compra', require('../schemas/compra') )
        Compra.findOneAndDelete({ _id: compraId }, (err, compraRemoved) => {
            conn.close()
            mongoose.connection.close()
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
        const bd = req.params.bd
        const conn = con(bd)
        var Compra = conn.model('Compra', require('../schemas/compra') )
        var CompraItem = conn.model('CompraItem', require('../schemas/compra_item') )
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
                        mongoose.connection.close()
                        conn.close()
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
        const bd = req.params.bd
        const conn = con(bd)
        var Compra = conn.model('Compra', require('../schemas/compra') )
        var CompraItem = conn.model('CompraItem', require('../schemas/compra_item') )
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
                        mongoose.connection.close()
                        return res.status(200).send({
                            status: 'error',
                            message: 'Ocurrio un error.'
                        })      
                    }else{
                        compra.items.push(itmSaved._id)
                        compra.save()
                        CompraItem.findById(itmSaved._id).populate('producto').exec((err, item)=> {
                            mongoose.connection.close()
                            conn.close()
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
        const bd = req.params.bd
        const conn = con(bd)
        
        var CompraItem = conn.model('CompraItem', require('../schemas/compra_item') )

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