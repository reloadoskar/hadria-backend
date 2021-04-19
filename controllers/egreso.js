'use strict'
const con = require('../conections/hadriaUser')
const controller = {
    save: async (req, res) => {
        //recoger parametros
        const params = req.body;
        const bd = req.params.bd
        const conn = con(bd)
        const Egreso = conn.model('Egreso')
        let egreso = new Egreso()
        const resp = await Egreso
            .estimatedDocumentCount()
            .then(count => {
                egreso.folio = ++count
                egreso.ubicacion = params.ubicacion
                egreso.concepto = params.concepto
                egreso.tipo = params.tipo
                egreso.descripcion = params.descripcion
                egreso.fecha = params.fecha
                egreso.importe = params.importe
                egreso.saldo = 0
                egreso.save((err, egreso) => {
                    conn.close()
                    if( err || !egreso){
                        return res.status(404).send({
                            status: 'error',
                            message: 'No se registró el egreso.' + err
                        })
                    }
                    return res.status(200).send({
                        status: 'success',
                        message: 'Egreso registrado correctamente.',
                        egreso
                    })
                })
            })
    },

    getEgresos: async (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        const Egreso = conn.model('Egreso')
        const resp = await Egreso
            .find({saldo:{$eq:0}}).sort({fecha: -1, createdAt: -1})
            .lean()
            .populate('ubicacion')
            .populate('compra', 'clave')
            .then(egresos=> {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    egresos
                })
            })
            .catch(err => {
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los egresos' + err
                })
            })
    },

    getEgreso: async (req, res) => {
        const egresoId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        const Egreso = conn.model('Egreso')
        if (!egresoId) {
            conn.close()
            return res.status(404).send({
                status: 'error',
                message: 'No existe el egreso'
            })
        }

        const resp = await Egreso
            .findById(egresoId)
            .lean()
            .populate('compra', 'clave')
            .then( egreso => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    egreso
                })
            })
            .catch(err => {
                conn.close()            
                return res.status(404).send({
                    status: 'success',
                    message: 'No existe el egreso.',
                    err
                })
            })
    },

    update: async (req, res) => {
        const egresoId = req.params.id;
        const params = req.body;
        const bd = req.params.bd
        const conn = con(bd)
        const Egreso = conn.model('Egreso')

            // Find and update
        const resp = await Egreso
            .findOneAndUpdate({ _id: egresoId }, params, { new: true })
            .then(egresoUpdated => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    egreso: egresoUpdated
                })
            })
            .catch(err => {
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al actualizar',
                    err
                })                
            })
    },

    delete: (req, res) => {
        const egresoId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        const Egreso = conn.model('Egreso')
        Egreso.findById(egresoId, (err, egreso) => {
            if(egreso.compra){
                return res.status(500).send({
                    status: 'error',
                    message: 'No se puede eliminar este egreso, esta relacionado a una compra, acceda a compras para eliminarlo desde ahí'
                })
            }
            //         compra.pagos.egreso(egresoId).remove()
            //         compra.saldo = compra.saldo + egreso.importe
            //         compra.save((err, compraUpdated) => {
            //             if (err || !compraUpdated) {
            //                 console.log('error' + err);
            //             }
            //         })
            //     })
            // }
            Egreso.findOneAndDelete({ _id: egresoId }, (err, egresoRemoved) => {
                conn.close()
                if (err || !egresoRemoved) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'No se pudo borrar el egreso.'
                    })
                }
                return res.status(200).send({
                    status: 'success',
                    egresoRemoved
                })
            })
        })


    }

}

module.exports = controller;