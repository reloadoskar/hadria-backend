'use strict'
var mongoose = require('mongoose')
const con = require('../conections/hadriaUser')

var controller = {
    getBalance: (req, res) => {
        var bd = req.params.bd
        const conn = con(bd)
        var Balance = conn.model('Balance')
    
        Balance.findOne().sort('-fecha').exec((err, doc) => {
            if(err){console.log(err)}
            return res.status(200).send({
                status: 'success',
                message: 'Ok',
                doc
            })
        })

    },

    disponiblexUbicacion: (req, res) => {
        var bd = req.params.bd
        const conn = con(bd)

        var Ubicacion = conn.model('Ubicacion')

        Ubicacion.aggregate()
            .lookup({ from: 'ingresos', localField: "_id", foreignField: 'ubicacion', as: 'ingresos' })
            .lookup({ from: 'egresos', localField: "_id", foreignField: 'ubicacion', as: 'egresos' })
            // .match({'egresos.concepto': {$ne: 'COMPRA'}})
            // .project({
            //     nombre:1,
            //     'ingresos':1,
            //     egresos:1
            // })
            .exec((err, disp)=>{
                if(err){console.log(err)}
                return res.status(200).send({
                    status: "success",
                    disp
                })
            })
    },
}

module.exports = controller