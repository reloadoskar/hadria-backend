'use strict'
var mongoose = require('mongoose');
const con = require('../conections/hadriaUser')

var controller = {
    save: (req, res) => {
        var params = req.body
        const bd = req.params.bd
        const conn = con(bd)
        const Ingreso = conn.model('Ingreso')
        var ingreso = new Ingreso()
        ingreso.ubicacion = params.ubicacion
        ingreso.fecha = params.fecha
        ingreso.concepto = "VENTA"
        ingreso.tipoPago = params.tipoPago
        ingreso.importe = params.total
        if(params.tipoPago === 'CREDITO'){
            ingreso.acuenta = params.acuenta
            ingreso.saldo = params.saldo
        }

        if(params.venta){
            ingreso.descripcion = "CREDTIO A: "+ params.cliente.nombre + " FOLIO: "+ venta.folio
            ingreso.venta = venta._id
        }

        ingreso.save((err, ingresoSaved) => {
            if(err){console.log(err)}
            conn.close()
            return res.status(500).send({
                status: "success",
                message: "Cuenta por cobrar creada correctamente.",
                cxc: ingresoSaved
            })
        })
    },

    getCuentasCliente: (req,res) => {
        const bd= req.params.bd
        const clienteID= req.params.id
        const conn = con(bd)
        var Venta = conn.model('Venta',require('../schemas/venta') )
        Venta.find({cliente: clienteID, saldo: {$gt: 0}})
        .exec((err, cuentas)=>{
            return res.status(200).send({
                status: "success",
                cuentas
            })
        })
    },

    getCuentas: (req, res) => {
        const bd= req.params.bd
        const conn = con(bd)
        const Cliente = conn.model('Cliente',require('../schemas/cliente') )
        Cliente.find({cuentas: {$ne: []}})
        .select('nombre dias_de_credito cuentas')
        .populate({
            path: 'cuentas',
            match: { saldo: {$ne: 0} },
            select: 'concepto importe acuenta saldo venta',
            populate: { path: 'venta', select: 'items folio fecha importe'}
        })
        .exec((err, clientes)=>{
            if (err){
                return res.status(500).send({
                    status: "error",
                    err
                })
            } 
            return res.status(200).send({
                status: "success",
                clientes
            })
        })
    },

    getCxcPdv: (req, res) =>{
        const bd= req.params.bd
        const conn = con(bd)
        const Ingreso = conn.model('Ingreso')
        Ingreso.find({saldo: {$gt: 0}})
            .populate({path:'venta', select: 'cliente folio', populate: { path: 'cliente', select: 'nombre'}})            
            .populate('ubicacion')
            .exec((err, cuentas) => {
                if(err){console.error(err)}
                return res.status(200).send({
                    status:"success",
                    cuentas
                })
            })
    },

    savePago: (req, res) => {
        var params = req.body
        const bd = req.params.bd
        const conn = con(bd)
        var Ingreso = conn.model('Ingreso')
        var Cliente = conn.model('Cliente')
        var Venta = conn.model('Venta')

        // CREAMOS EL INGRESO
        var ingreso = new Ingreso()
        ingreso.importe = params.importe
        ingreso.ubicacion = params.ubicacion
        ingreso.fecha = params.fecha                
        ingreso.concepto = "COBRANZA"
        ingreso.descripcion = "PAGO DE: " + params.cuenta.venta.cliente.nombre + " " + params.referencia
        ingreso.tipoPago = params.tipoPago
        
        //ACTUALIZAMOS SALDO CLIENTE Y AGREGAMOS PAGO
        var cltId = params.cuenta.venta.cliente._id
        Cliente.findById(cltId).exec((err, cliente)=>{
            if(err){console.log(err)}

            cliente.pagos.push(ingreso._id)
            cliente.credito_disponible += params.importe

            cliente.save()
            
            let pago = params.importe
            Ingreso.findById(params.cuenta._id).exec((err, ing)=>{
                if(err){console.log(err)}
                
                ing.saldo -= pago
                ing.save()

                Venta.findById(params.cuenta.venta._id).exec((err, venta)=>{
                    if(err){console.error(err)}
                    venta.pagos.push(ingreso._id)
                    venta.save()
                    ingreso.save().then((err, ingreso) => {
                        if(err){console.log(err)}
                        conn.close()                        
                        return res.status(200).send({
                            status: 'success',
                            message: 'Cobro agregado correctamente.',
                            ingreso
                        })                
                    })
                })
            })
        })            
    }
}

module.exports = controller;