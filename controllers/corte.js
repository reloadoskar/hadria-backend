'use strict'

var Corte = require('../models/corte');
var Venta = require('../models/venta')
var Egreso = require('../models/egreso')
var Ingreso = require('../models/ingreso')

var controller = {
    getData: (req, res) => {
        var ubicacion = req.params.ubicacion;
        var fecha = req.params.fecha;
        var corte = {}
        Venta
        .find({"ubicacion": ubicacion, "fecha": fecha })
        .select('ubicacion cliente tipoPago acuenta saldo importe items folio')
        .populate({
            path: 'items',
            populate: { path: 'producto'},
        })
        .populate({
            path: 'items.compra',
            select: 'clave '
        })
        .populate('ubicacion')
        .populate('cliente')
        .sort('ubicacion cliente tipoPago acuenta saldo importe')
        .exec()
        .then(ventas => {
            corte.ventas = ventas
            return Egreso.find({"ubicacion": ubicacion, "fecha": fecha})
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
            return Venta.find({"tipoPago": 'CRÉDITO', "ubicacion": ubicacion, "fecha": fecha })
            .select('folio ubicacion cliente tipoPago acuenta items saldo importe')
            .populate('ubicacion')
            .populate('cliente')
            .populate({
                path: 'items',
                populate: { path: 'producto'},
            })
            .populate({
                path: 'items.compra',
                select: 'clave '
            })
            .sort('ubicacion cliente tipoPago acuenta saldo importe')
            .exec()
        })
        .then(creditos => {
            corte.creditos = creditos
            res.status(200).send({
                corte
            })
        })


    },

    save: (req, res) => {
        var data = req.body
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
                    egreso.save((err, egreso) => {
                        if( err || !egreso){
                            return res.status(404).send({
                                status: 'error',
                                message: 'No se registró el egreso.' + err
                            })
                        }

                        var ingreso = new Ingreso()
                        ingreso.ubicacion = "5de69405393cee89bef96299"
                        ingreso.concepto = "RECEPCIÓN DE CORTE"
                        ingreso.fecha = data.fecha
                        ingreso.importe = data.total
                        ingreso.save((err, ingresoSaved) => {
                            if(err){
                                return res.status(500).send({
                                    status: 'error',
                                    message: "No se pudo registrar el Ingreso."
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

        Corte.find({"ubicacion": ubicacion, "fecha": fecha}).
        exec((err, corte)=>{
            if(err || !corte) res.status(404).send()
            res.status(200).send({
                status: 'success',
                corte: corte
            })
        })
    },
    
    getEgresos: (req, res) => {
        var ubicacion = req.params.ubicacion;
        var fecha = req.params.fecha;
        
        Egreso.find({"ubicacion": ubicacion, "fecha": fecha})
            .exec((err, egresos) => {
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

        Ingreso.find({"ubicacion": ubicacion, "fecha": fecha, concepto: {$ne: 'VENTA'}})
            .exec((err, ingresos) => {
                if(err)console.log(err)
                res.status(200).send({
                    status: 'success',
                    ingresos: ingresos
                })
            }) 
    }
}

module.exports = controller