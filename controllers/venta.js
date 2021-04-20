'use strict'
var mongoose = require('mongoose');
const con = require('../conections/hadriaUser')

var controller = {
    save: async (req, res) => {
        const bd = req.params.bd
        const params = req.body
        const conn = con(bd)

        const Ingreso = conn.model('Ingreso')
        const Venta = conn.model('Venta')
        const VentaItem = conn.model('VentaItem')
        const CompraItem = conn.model('CompraItem')
        const Cliente = conn.model('Cliente')

        var ingreso = new Ingreso
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
        
        Venta.estimatedDocumentCount().then(count => {
            venta.folio = count +1
            venta.ubicacion = params.ubicacion
            venta.cliente = params.cliente
            venta.fecha = params.fecha
            venta.importe = params.total
            venta.tipoPago = params.tipoPago
            
            let items = params.items

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
                            .exec((err, vnt) => {
                    if(err){console.log(err)}
                        return res.status(200).send({
                    status: "success",
                    message: "Venta guardada correctamente.",
                    venta: vnt
                })    
                })
                
                
            })
        })


    },
    
    getVentas: (req, res) => {
        const bd= req.params.bd
        const conn = con(bd)
        var Venta = conn.model('Venta')
        Venta.find({})
        .populate('compras')
        .exec((err, ventas) => {
            conn.close()
            if(err)console.log(err)
            return res.status(200).send({
                status: "success",
                ventas
            })
        })
    },

    getVenta: (req, res) => {
        const folio = req.params.folio
        const bd= req.params.bd
        const conn = con(bd)
        const Venta = conn.model('Venta')
        Venta.findOne({"folio": folio })
            .populate({
                path: 'items',
                populate: { path: 'producto'},
            })
            .populate({
                path: 'items',
                populate: { path: 'compra'},
            })
            .populate({path:'pagos', populate: {path: 'ubicacion'}})            
            .populate('ubicacion')
            .populate('cliente')
            .exec((err, venta) => {            
                conn.close()
                if(err){
                    return res.status(500).send({
                        status: "error",
                        message: err
                    })
                }
                if(!venta){
                    return res.status(200).send({
                        status: "error",
                        message: "No existe la venta."                        
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
        const productId = req.params.id;
        const bd= req.params.bd
        const conn = con(bd)
        const Venta = conn.model('Venta')
        Venta.aggregate()
            .project({"items": 1, fecha: 1, cliente: 1, tipoPago:1, })
            // .sort("items.item")
            .match({"items.item": productId})
            .exec((err, ventas) => {
                conn.close()
                if(err)console.log(err)
                res.status(200).send({
                    status: "success",
                    ventas
                })
            })
    },

    getResumenVentas: async (req, res) =>{
        const bd= req.params.bd
        const ubicacion = req.params.ubicacion
        const fecha = req.params.fecha
        const conn = con(bd)
        const VentaItem = conn.model('VentaItem')
        try{
            const response = await VentaItem
                .aggregate()
                .match({ubicacion: mongoose.Types.ObjectId(ubicacion), fecha: fecha })
                .group({_id: {producto: "$producto"}, cantidad: { $sum: "$cantidad" }, empaques: { $sum: "$empaques" }, importe: { $sum: "$importe" } })
                .lookup({ from: 'productos', localField: "_id.producto", foreignField: '_id', as: 'producto' })
                .sort({"_id.producto": 1, "_id.precio": -1})
                .unwind('producto')
                .then(ventas =>{
                    return res.status(200).send({
                        status: 'success',
                        ventas,
                    })
                })
                .catch(err => {
                    return res.status(404).send({
                        status: 'error',
                        err
                    })
                })                    
        }catch(err){
            return res.status(200).send({
                status: 'error',
                err
            })
        }
        
    },

    getVentasSemana: (req, res) => {
        let fecha1 = req.query.f1
        let fecha2 = req.query.f2
        const bd= req.params.bd
        const conn = con(bd)
        const Venta = conn.model('Venta')
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
            conn.close()
            if(err)console.log(err)
                res.status(200).send({
                    status: "success",
                    ventas
                })
        })
    },

    update: (req, res) => {
        let compraId = req.params.id;
        const bd= req.params.bd
        const conn = con(bd)
        const Venta = conn.model('Venta')
        //recoger datos actualizados y validarlos
        let params = req.body;
            
            // Find and update
            Compra.findOneAndUpdate({_id: compraId}, params, {new:true}, (err, compraUpdated) => {
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
        const id = req.params.id;
        const bd= req.params.bd
        const conn = con(bd)
        const Venta = conn.model('Venta')
        const VentaItem = conn.model('VentaItem')
        const CompraItem = conn.model('CompraItem')
        const Ingreso = conn.model('Ingreso')
        
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
                    let stockUpdated = 0
                    let empUpdated = 0 
                        stockUpdated = item.compraItem.stock + item.cantidad
                        empUpdated = item.compraItem.empaquesStock + item.empaques
                    CompraItem.findById(item.compraItem._id).exec((err, item) => {
                        if(err){console.log(err)}
                        item.stock = stockUpdated
                        item.empaquesStock = empUpdated
                        item.save( (err, itemSaved) => {
                            if(err)console.log("Error al actualizar stock"+err)
                        })
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
