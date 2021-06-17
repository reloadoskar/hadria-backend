const con = require('../conections/hadriaUser')

exports.cxp_list = async (req, res) => {
    const bd = req.params.bd
    const conn = con(bd)
    const Provedor = conn.model('Provedor')

    const resp = await Provedor
        .find({cuentas: {$ne: []}})
        .select('nombre tel1 diasDeCredito cuentas')
        .populate({
            path: 'cuentas',
            match: { saldo: {$ne: 0} },
            select: 'concepto folio importe saldo compra',
            populate: { path: 'compra', select: 'clave folio fecha'}
        })
        .lean()
        .then( provs => {
            conn.close()
            return res.status(200).send({
                status: 'success',
                message: 'Cuentas encontradas',
                cuentas: provs
            })
        })
        .catch(err => {
            conn.close()
            return res.status(500).send({
                status: 'error',
                message: 'Cuentas encontradas',
                err
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
                            conn.close()
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
    const params = req.body
    const bd = req.params.bd
    const conn = con(bd)
    const compras = params.compras
    const importe = params.importe
    const Egreso = conn.model('Egreso')
    let saldoCompra = 0
    compras.map(compra => {
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
    conn.close()
    return res.status(200).send({
        status: 'success',
        message: "Saldo actualizado",

    })
}