'use strict'
const mongoose = require('mongoose');

const con = require('../conections/hadriaUser')

var controller = {
    save: (req, res) => {
        const params = req.body;
        const bd = req.params.bd
        const conn = con(bd)
        const Compra = conn.model( 'Compra')
        const CompraItem = conn.model('CompraItem')
        const Egreso = conn.model('Egreso')
        const Provedor = conn.model('Provedor')
        
        Compra.estimatedDocumentCount().then(count => {
            var compra = new Compra();
            compra._id = mongoose.Types.ObjectId()
            compra.folio = count + 1
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
                let sigCompra = c +1
                compra.clave = params.provedor.clave + "-" + sigCompra
                
                let i = params.items
                let itmsToSave = []
                i.map((item) => {
                    let compraItem = {}
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
                        let g = params.gastos
                        let cgastos = []
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
                                conn.close()  
                                return res.status(500).send({
                                    status: 'error',
                                    message: 'Error al devolver la compra' + err
                                })
                            }
                            Egreso.estimatedDocumentCount().then( c => {
                                let egItm = new Egreso()
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

    getComprasActivas: async (req, res) => {
        const bd = req.params.bd
        const conexion = con(bd)
        try {
            const Compra = conexion.model('Compra')
            const resp = await Compra
                .find({status:"ACTIVO"})
                .sort('folio')
                .lean()
                .populate('provedor', 'nombre')
                .populate('ubicacion')
                .populate('tipoCompra')
                .populate({
                    path: 'items',
                    populate: { path: 'producto'},
                })
                .then(compras => {
                    conexion.close()
                    return res.status(200).send({    
                        status: 'success',
                        compras: compras
                    })
                })
                .catch(err => {
                    conexion.close()
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al devolver los compras' + err
                    })
                })
        } catch (error) {
            console.log(error)
            conexion.close()
            return res.status(500).send({
                status: 'error',
                message: 'Error al devolver los compras' + err
            })
        }
    },

    getCompras: async (req, res) => {
        const bd = req.params.bd
        let mes = req.params.mes
        // mes++
        if(mes<10){
            mes = "0"+ mes
        }
        const conn = con(bd)
        const Compra = conn.model('Compra')
         
        const resp = await Compra
            .find({
                fecha: {$gt: "2021-"+mes+"-00" , $lt: "2021-"+mes+"-32"}
            })
            .sort('folio')
            .lean()
            .populate('provedor', 'nombre diasDeCredito comision email cta1 tel1')
            .populate('ubicacion')
            .populate('tipoCompra')
            .populate({
                path: 'items',
                populate: { path: 'producto'},
            })
            .populate({
                path: 'items',
                populate: { path: 'ubicacion'},
            })
            .populate({
                path: 'items',
                populate: { path: 'producto', populate: { path: 'unidad'} },
            })
            .populate({
                path: 'items',
                populate: { path: 'producto', populate: { path: 'empaque'} },
            })
            .populate('gastos')
            .populate('pagos')
            .populate('ventaItems')
            .populate({
                path: 'ventaItems',
                populate: { path: 'producto'},
            })
            .populate({
                path: 'VentaItems',
                populate: { path: 'producto', populate: { path: 'unidad'} },
            })
            .populate({
                path: 'ventaItems',
                populate: { path: 'producto', populate: { path: 'empaque'} },
            })
            .then(compras => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    compras: compras
                })
            })
            .catch(err => {
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los compras' + err
                })
            })
    },

    getCompra: async (req, res) => {
        const compraId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        const Compra = conn.model('Compra')
        const VentaItem = conn.model('VentaItem')
        const Egreso = conn.model('Egreso')
        let data = {}

        const compra = await Compra
            .findById(compraId)
            .populate('provedor', 'clave nombre tel1 cta1 email diasDeCredito comision')
            .populate('gastos')
            .populate('ubicacion')
            .populate('tipoCompra')
            .populate('ventas')
            .populate({
                path: 'items',
                populate: { path: 'ubicacion'},
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
            .lean()
            .catch( err => {
                conn.close()
                return res.status(404).send({
                    status: 'error',
                    err
                })
            })
        data.compra = compra
                
        const ventas = await VentaItem.find({compra: compra._id})
                .lean()
                .populate('venta')
                .populate({
                    path: 'venta',
                    populate: { path: 'cliente'},
                })
                .populate('producto')
                .populate('ubicacion')

        data.ventas = ventas

        const ventasGroup = await VentaItem
                .aggregate()
                .match({compra: data.compra._id})
                .group({_id: "$producto", producto: {$first: "$producto"}, compraItem: {$first: "$compraItem"}, cantidad: { $sum: "$cantidad" }, empaques: { $sum: "$empaques" }, importe: { $sum: "$importe" } })
                // .group({_id:"$compraItem", producto: {$first: "$producto"}, cantidad: { $sum: "$cantidad" }, empaques: { $sum: "$empaques" }, importe: { $sum: "$importe" } })
                .lookup({ from: 'productos', localField: "producto", foreignField: '_id', as: 'producto' })
                .unwind('producto')
                .lookup({ from: 'unidads', localField: "producto.unidad", foreignField: '_id', as: 'producto.unidad' })
                .lookup({ from: 'empaques', localField: "producto.empaque", foreignField: '_id', as: 'producto.empaque' })
                .unwind('producto.empaque')
                .unwind('producto.unidad')
                // .sort({"_id": 1})
                .exec()
    
        data.ventasGroup = ventasGroup        

        const egresos = await Egreso
            .find({compra: data.compra._id, 
                // tipo: {$eq: 'GASTO DE COMPRA'}
            })
            .lean()
            .populate('ubicacion')

        data.egresos = egresos
        conn.close()
        return res.status(200).send({
            status: 'success',
            data
        })
    },

    close: async (req, res) => {
        const compraId = req.params.id
        const bd = req.params.bd
        const conn = con(bd)
        const Compra = conn.model('Compra')
        const resp = await Compra
            .findOneAndUpdate({_id: compraId}, {status: "CERRADO"} )
            .then(compraUpdated => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    message: 'Compra cerrada correctamente.',
                    compraUpdated
                })
            })
            .catch(err => {
                conn.close()
                return res.status(404).send({
                    status: "error",
                    err
                })
            })
    },

    update: async (req, res) => {
        const compra = req.body
        const bd = req.params.bd
        const conn = con(bd)
        const Compra = conn.model('Compra')
        const resp = await Compra
            .findByIdAndUpdate(compra._id, compra, { new: true }, (err, compraUpdated) => {
                conn.close()
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
        const compraId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        const Compra = conn.model('Compra')
        Compra.findOneAndDelete({ _id: compraId }, (err, compraRemoved) => {
            conn.close()
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
        const compraId = req.params.id
        const bd = req.params.bd
        const conn = con(bd)
        const Compra = conn.model('Compra')
        const CompraItem = conn.model('CompraItem')
        Compra.findById(compraId).exec((err, compra) => {
            compra.status = "CANCELADO"

            compra.save((err, saved) => {
                if(err | !saved){
                    conn.close()
                    return res.status(200).send({
                        status: 'error',
                        message: 'Ocurrió un error',
                        err
                    })
                }else{
                    CompraItem.updateMany({"compra": saved._id}, {"stock": 0}, (err, n) => {
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
        const Compra = conn.model('Compra')
        const CompraItem = conn.model('CompraItem')
        let item = req.body
        let newItem = new CompraItem()
        newItem.compra = item.compra
        newItem.producto = item.producto
        newItem.ubicacion = item.compra.ubicacion
        newItem.cantidad = item.cantidad
        newItem.stock = item.stock
        newItem.empaques = item.empaques
        newItem.empaquesStock = item.stock
        newItem.costo = item.costo
        newItem.importe = item.importe

        newItem.save((err, itmSaved) => {
            if(err || !itmSaved) {
                conn.close()  
                return res.status(200).send({
                    status: 'error',
                    message: 'Ocurrio un error.'
                })
            }else{
                Compra.findById(newItem.compra).exec((err,compra) => {
                
                    if(err){
                        conn.close()
                        return res.status(200).send({
                            status: 'error',
                            message: 'Ocurrio un error.'
                        })      
                    }else{
                        compra.items.push(itmSaved._id)
                        compra.save()
                        CompraItem.findById(itmSaved._id).populate('producto').exec((err, item)=> {
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
        const item = req.body;
        const bd = req.params.bd
        const conn = con(bd)
        
        const CompraItem = conn.model('CompraItem')

        CompraItem.findById(item.item_id).exec( (err, compraItem) => {
            if(err || !compraItem){
                conn.close()
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
                    conn.close()
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
    },

    recuperarVentas: async (req, res) => {
        const id = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        const VentaItem = conn.model('VentaItem')
        const Compra = conn.model('Compra')

        const ventas = await VentaItem.find({compra: id}).lean()

        const compra = await Compra.findById(id)
            compra.ventas = []
            compra.ventaItems = []
            ventas.forEach(element => {
                compra.ventaItems.push(element._id)
            })
            compra.save()
            .then(cmp =>{
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    message: 'Item actualizado.',
                    compra: cmp
                })
            })
            
    },
    recupearGastos: async (req, res) => {
        const id = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        const Compra = conn.model('Compra')
        const Egreso = conn.model('Egreso')

        const egresos = await Egreso.find({compra:id}).lean()
        const compra = await Compra.findById(id)
            compra.gastos = []
            compra.pagos = []

            egresos.map(eg=>{
                if(eg.concepto !== "PAGO" && eg.importe > 0 ){
                    compra.gastos.push(eg._id)
                }else{
                    compra.pagos.push(eg._id)
                }
            })

            compra
            .save()
            .then(cmp=>{
                cmp
                .populate('gastos')
                .populate('pagos')
                .populate('provedor', 'nombre')
                .populate('ubicacion')
                .populate('tipoCompra')
                .populate('ventaItems',(err, comp) =>{
                    conn.close()
                    return res.status(200).send({
                        status: 'success',
                        message: 'Item actualizado.',
                        compra: comp
                    })
                })
                
            })
    }

}

module.exports = controller;