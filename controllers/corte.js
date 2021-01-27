'use strict'
const con = require('../conections/hadriaUser')
var mongoose = require('mongoose');

var controller = {
    getData: (req, res) => {
        var ubicacion = req.params.ubicacion;
        var fecha = req.params.fecha;
        const bd = req.params.bd
        const conn = con(bd)
        var Venta = conn.model('Venta', require('../schemas/venta'))
        var Ingreso = conn.model('Ingreso',require('../schemas/ingreso') )
        var Egreso = conn.model('Egreso',require('../schemas/egreso') )
        var corte = {}
         
        Venta.find({"ubicacion": ubicacion, "fecha": fecha })
        .select('ubicacion cliente tipoPago saldo importe items folio')
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
        .exec() 
        .then( ventas => {
            if(!ventas){console.log('error en ventas')}
            corte.ventas = ventas
            return Egreso.find({
                ubicacion: ubicacion, 
                fecha: fecha, 
                tipo: {$ne: 'COMPRA'}
            })
            .select("ubicacion concepto descripcion fecha importe")
            .populate('ubicacion')
            .sort('ubicacion concepto descripcion fecha importe')
            .exec()
        })
        .then(egresos => {
            corte.egresos =egresos
            return Ingreso.find({"ubicacion": ubicacion, "fecha": fecha, concepto: {$ne: 'VENTA'}})
            .select('ubicacion concepto descripcion fecha importe')
            .populate('ubicacion')
            .sort('ubicacion concepto descripcion fecha importe')
            .exec()
        })
        .then(ingresos => {
            corte.ingresos = ingresos
            // return Ingreso.find({"tipoPago": 'CRÉDITO', "ubicacion": ubicacion, "fecha": fecha})
            return Venta.find({"tipoPago": 'CRÉDITO', "ubicacion": ubicacion, "fecha": fecha })
            .select('folio ubicacion cliente tipoPago acuenta items saldo importe')
            .populate('ubicacion')
            // .populate('venta')
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
            .exec()
        })
        .then(creditos => {
            conn.close()
            mongoose.connection.close()
            corte.creditos = creditos
            res.status(200).send({
                corte
            })
        })


    },

    save: (req, res) => {
        var data = req.body
        const bd = req.params.bd
        const conn = con(bd)
        var Corte = conn.model('Corte')
        var Egreso = conn.model('Egreso')
        var Ingreso = conn.model('Ingreso')
        Corte.create(data, (err, corte) => {
            if(err || !corte){
                return res.status(404).send({
                    status: 'error',
                    message: 'No se puedo guardar el corte.'+err,
                })
            }else{
                // guardar egreso e ingreso, definir a donde se va el corte...
                var egreso = new Egreso()
                Egreso.estimatedDocumentCount((err, count) => {
                    egreso.folio = ++count
                    egreso.ubicacion = data.ubicacion
                    egreso.concepto = "CIERRE DE CORTE"
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
                        var ingreso = new Ingreso()
                        
                        ingreso.ubicacion = data.enviarA._id
                        ingreso.concepto = "RECEPCIÓN DE CORTE"
                        ingreso.fecha = data.fecha
                        ingreso.importe = data.total
                        ingreso.saldo = 0
                        ingreso.save((err, ingresoSaved) => {
                                mongoose.connection.close()
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
            }
        })
    },

    exist: (req, res) => {
        var ubicacion = req.params.ubicacion;
        var fecha = req.params.fecha;
        const bd = req.params.bd
        const conn = con(bd)
        
        var Corte = conn.model('Corte',require('../schemas/corte') )
        
        Corte.find({"ubicacion": ubicacion, "fecha": fecha}).
        exec((err, corte)=>{
            conn.close()
            mongoose.connection.close()
            if(err || !corte) res.status(404).send({
                status: "error",
            })
            res.status(200).send({
                status: 'success',
                corte: corte
            })
        })
    },
    
    getEgresos: (req, res) => {
        var ubicacion = req.params.ubicacion;
        var fecha = req.params.fecha;
        const bd = req.params.bd
        const conn = con(bd)
        
        var Egreso = conn.model('Egreso',require('../schemas/egreso') )
        Egreso.find({"ubicacion": ubicacion, "fecha": fecha})
            .exec((err, egresos) => {
                mongoose.connection.close()
                conn.close()
                if(err) console.log(err)
                res.status(200).send({
                    status: 'success',
                    message: 'se encontraron resultados:',
                    egresos: egresos
                })
        })

    },

    getIngresos: (req, res) => {
        var ubicacion = req.params.ubicacion
        var fecha = req.params.fecha
        const bd = req.params.bd
        const conn = con(bd)
        
        var Ingreso = conn.model('Ingreso',require('../schemas/ingreso') )
        Ingreso.find({"ubicacion": ubicacion, "fecha": fecha, concepto: {$ne: 'VENTA'}})
            .exec((err, ingresos) => {
                conn.close()
                mongoose.connection.close()
                if(err)console.log(err)
                res.status(200).send({
                    status: 'success',
                    ingresos: ingresos
                })
            }) 
    }
}

module.exports = controller