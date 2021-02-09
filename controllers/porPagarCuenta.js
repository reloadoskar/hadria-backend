const con = require('../conections/hadriaUser')

exports.cxp_list = (req, res) => {
    const bd = req.params.bd
    const conn = con(bd)
    var Provedor = conn.model('Provedor', require("../schemas/provedor"))

    Provedor.find({cuentas: {$ne: []}})
    .select('nombre tel1 diasDeCredito cuentas')
    .populate({
        path: 'cuentas',
        match: { saldo: {$ne: 0} },
        select: 'concepto folio importe saldo compra',
        populate: { path: 'compra', select: 'clave folio fecha'}
    })
    .exec((err, provs) => {
        if(err){console.log(err)}
        return res.status(200).send({
            status: 'success',
            message: 'Cuentas encontradas',
            cuentas: provs
        })
    })
}

exports.cxp_create_pago = (req, res) => {
    var params = req.body
    const bd = req.params.bd
    const conn = con(bd)

    var Egreso = conn.model('Egreso')
    var Provedor = conn.model('Provedor')

    Egreso.estimatedDocumentCount()
    .exec((err,c)=> {
        if(err){console.log(err)}
        var nextFolio = c + 1
        var egreso = new Egreso()
        egreso.folio = nextFolio
        egreso.ubicacion = params.ubicacion
        egreso.fecha = params.fecha
        egreso.tipo = 'PAGO'
        egreso.importe = params.importe
        egreso.saldo = 0
        egreso.descripcion = "PAGO A: " + params.cuenta.concepto + " #"+ params.cuenta.folio
        egreso.concepto = "PAGO" 
        Provedor.findById(params.provedor).exec((err, provedor)=> {
            if(err || !provedor){console.log(err)}
            // console.log(provedor)
            provedor.pagos.push(egreso._id)
            provedor.save((err, saved)=>{
                if(err){console.log(err)}
                egreso.save((err, egSaved) => {
                    if(err){console.log(err)}
                    Egreso.findById(params.cuenta._id).exec((err, eg)=>{
                        if(err){
                            return res.status(500).send({
                                status: "error",
                                message: "¡Ups! Ocurrió un Eerror.",
                                err
                            })
                        }
                        eg.saldo -= params.importe
                        eg.save((err, saved)=>{
                            conn.close()
                            return res.status(200).send({
                                status: "success",
                                message: "Pago registrado correctamente",
                                pago: egSaved
                            })
                        })
                    })


                })
            })
        })
    })
}

exports.cxp_update_saldo = (req, res) => {
    var params = req.body
    const bd = req.params.bd
    const conn = con(bd)
    var compras = params.compras
    var importe = params.importe
    var saldoCompra = 0
    compras.map(compra => {
        var Egreso = conn.model('Egreso')
        if(importe>0){
            if(importe >= compra.saldo) {
                Egreso.findByIdAndUpdate(compra._id, { saldo: 0 })
                return importe -= compra.saldo
    
            }else{
                saldoCompra = compra.saldo - importe
                Egreso.findByIdAndUpdate(compra._id, { saldo: saldoCompra })
                return importe = 0
            }
        }
    })



    return res.status(200).send({
        status: 'success',
        message: "Saldo actualizaso",

    })
}