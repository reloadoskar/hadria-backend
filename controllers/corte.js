'use strict'
const con = require('../conections/hadriaUser')
var mongoose = require('mongoose');

var controller = {
    getData: async (req, res) => {
        const ubicacion = req.params.ubicacion;
        const fecha = req.params.fecha;
        const bd = req.params.bd
        const conn = con(bd)
        const Venta = conn.model('Venta')
        const Ingreso = conn.model('Ingreso')
        const Egreso = conn.model('Egreso')
        const Ubicacion = conn.model('Ubicacion')
        const VentaItem = conn.model('VentaItem')
        let corte = {}
        corte.fecha = fecha
        try{
            const ventas = await
                Venta.find({"ubicacion": ubicacion, "fecha": fecha })
                    .select('ubicacion cliente tipoPago saldo importe items folio')
                    .lean() 
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
                    .sort('folio')
                    .catch(err => {
                        throw new Error("No ventas " + err)
                    })
            corte.ventas = ventas

            const egresos = await Egreso
                .find({
                    ubicacion: ubicacion, 
                    fecha: fecha, 
                    tipo: {$ne: 'COMPRA'}})
                .select("ubicacion concepto descripcion fecha importe")
                .lean()
                .populate('ubicacion')
                .sort('ubicacion concepto descripcion fecha importe')

            corte.egresos = egresos

            const ingresos = await Ingreso
                .find({"ubicacion": ubicacion, "fecha": fecha, concepto: {$ne: 'VENTA'}})
                .select('ubicacion concepto descripcion fecha importe')
                .lean()
                .populate('ubicacion')
                .sort('ubicacion concepto descripcion fecha importe')
            
            corte.ingresos = ingresos

            const creditos = await Venta
                .find({"tipoPago": 'CRÉDITO', "ubicacion": ubicacion, "fecha": fecha })
                .select('folio ubicacion cliente tipoPago acuenta items saldo importe')
                .lean()
                .populate('ubicacion')
                .populate('cliente')
                .populate({
                    path: 'items',
                    populate: { path: 'producto'},
                })
                .populate({
                    path: 'items',
                    populate: {path: 'compra', select: 'clave folio'}
                })
                .sort('ubicacion cliente tipoPago acuenta saldo importe')

            corte.creditos = creditos
            
            const ub = await Ubicacion
                .findById(ubicacion)
                .lean()
                
            corte.ubicacion = ub

            const resumn = await VentaItem
                    .aggregate()
                    .match({ubicacion: mongoose.Types.ObjectId(ubicacion), fecha: fecha })
                    .group({_id: "$compraItem", item: {$first:"$compraItem"}, compra: {$first:"$compra"}, producto: {$first: "$producto"}, cantidad: { $sum: "$cantidad" }, empaques: { $sum: "$empaques" }, importe: { $sum: "$importe" } })
                    .lookup({ from: 'productos', localField: "producto", foreignField: '_id', as: 'producto' })
                    .lookup({ from: 'compras', localField: "compra", foreignField: '_id', as: 'compra' })
                    .lookup({ from: 'compraitems', localField: "item", foreignField: '_id', as: 'item' })
                    .unwind('producto')
                    .unwind('compra')
                    .unwind('item')
                    .sort({"_id": 1})
                    .catch( err => {
                        throw new Error("No se cargaron los items: "+ err)
                    })
                
            corte.resumenVentas = resumn

            const items = await VentaItem.find({ubicacion: ubicacion, fecha: fecha})
                .lean()
                .populate({path: 'venta', populate: {path: "cliente"} })
                .populate('compra')
                .populate('producto')
            corte.items = items
            conn.close()
            return res.status(200).send({
                corte
            })
                
        }catch(err){
            conn.close()
            return res.status(500).send({
                status: "error",
                message: 'No se cargó el corte correctamente.',
                corte,
                err
            })
        }

    },

    save: (req, res) => {
        const data = req.body
        const bd = req.params.bd
        const conn = con(bd)
        const Corte = conn.model('Corte')
        const Egreso = conn.model('Egreso')
        const Ingreso = conn.model('Ingreso')
        Corte.create(data, (err, corte) => {
            if(err || !corte){
                conn.close()
                return res.status(404).send({
                    status: 'error',
                    message: 'No se puedo guardar el corte.'+err,
                })
            }else{
                // guardar egreso e ingreso, definir a donde se va el corte...
                if(data.total > 0){
                    let egreso = new Egreso()
                    Egreso.estimatedDocumentCount((err, count) => {
                        egreso.folio = ++count
                        egreso.ubicacion = data.ubicacion
                        egreso.concepto = "ENVIO DE CORTE A " + data.enviarA.nombre
                        egreso.tipo = "CORTE"
                        egreso.fecha = data.fecha
                        egreso.importe = data.total
                        egreso.saldo = 0
                        egreso.save((err, egreso) => {
                            if( err || !egreso){
                                return res.status(404).send({
                                    status: 'error',
                                    message: 'No se registró el egreso.' + err
                                })
                            }
                            let ingreso = new Ingreso()
                            
                            ingreso.ubicacion = data.enviarA._id
                            ingreso.concepto = "RECEPCIÓN DE CORTE "+ data.ubicacion.nombre
                            ingreso.fecha = data.fecha
                            ingreso.importe = data.total
                            ingreso.saldo = 0
                            ingreso.save((err, ingresoSaved) => {
                                    conn.close()
                                    if(err){
                                        return res.status(500).send({
                                            status: 'error',
                                            message: "No se pudo registrar el Ingreso.",
                                            err
                                        })
                                    }                        
                                    return res.status(200).send({
                                            status: 'success', 
                                            message: 'Corte guardado correctamente',
                                            corte 
                                    })
                                })
                        })
                    })
                }else{
                    return res.status(200).send({
                        status: 'error',
                        message: 'No se guardó.'
                    })
                }
            }
        })
    },

    exist: async (req, res) => {
        const ubicacion = req.params.ubicacion;
        const fecha = req.params.fecha;
        const bd = req.params.bd
        const conn = con(bd)
        const Corte = conn.model('Corte')
        
        try{
            const response = await Corte
                .find({ubicacion: ubicacion, fecha: fecha})
                .lean()
                .then(corte => {
                    conn.close()
                    return res.status(200).send({
                        status: 'success',
                        corte: corte
                    })
                })
                .catch(err => {
                    conn.close()
                    return res.status(404).send({
                        status: "error",
                        err
                    })
                })
        }catch(err){
            conn.close()
            return res.status(200).send({
                status: 'error',
                err
            })
        }
    },

    open: async (req, res) => {
        const ubicacion = req.params.ubicacion;
        const fecha = req.params.fecha;
        const bd = req.params.bd
        const conn = con(bd)
        const Corte = conn.model('Corte')

        try{

            const res = await Corte
                .deleteOne({ubicacion: ubicacion, fecha: fecha})
                .then(res => {
                    conn.close()
                    return res.status(200).send({
                        status: 'success',
                        res
                    })
                })
                .catch(err => {
                    conn.close()
                    return res.status(404).send({
                        status: "error",
                        err
                    })
                })

        }catch(err){
            return res.status(200).send({
                status: 'error desconocido',
                err,
                ubicacion, fecha
            })
        }
    },
    
    getEgresos: async (req, res) => {
        const ubicacion = req.params.ubicacion;
        const fecha = req.params.fecha;
        const bd = req.params.bd
        const conn = con(bd)
        
        const Egreso = conn.model('Egreso')
        const resp = await Egreso
            .find({"ubicacion": ubicacion, "fecha": fecha})
            .lean()
            .then(egresos=> {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    message: 'se encontraron resultados:',
                    egresos: egresos
                })
            })
            .catch(err => {
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    message: 'No se encontraron resultados',
                    err
                })
            })
    },

    getIngresos: async (req, res) => {
        const ubicacion = req.params.ubicacion
        const fecha = req.params.fecha
        const bd = req.params.bd
        const conn = con(bd)
        
        const Ingreso = conn.model('Ingreso')
        const resp = await Ingreso
            .find({"ubicacion": ubicacion, "fecha": fecha, concepto: {$ne: 'VENTA'}})
            .lean()
            .then(ingresos => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    ingresos
                })
            })
            .catch(err => {
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    err
                })
            }) 
    }
}

module.exports = controller