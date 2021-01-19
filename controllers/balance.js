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
            .project({"nombre": 1, "ingresos.importe": 1, "egresos.importe": 1})
            .group({_id: "$nombre", tingresos: {$sum: "$ingresos.importe"}, tegresos: {$sum: "$egresos.importe"}})
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