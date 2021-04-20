'use strict'
const con = require('../conections/hadriaUser')

const controller = {
    getBalance: async (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        const Balance = conn.model('Balance', require('../schemas/balance'))
    
        const resp = await Balance.findOne().sort('-fecha')
            .lean()
            .then(doc => {
                return res.status(200).send({
                    status: "success",
                    doc
                })
            })
            .catch(err => {
                return res.status(500).send({status:"error", err})
            })
        
        conn.close()
    },

    disponiblexUbicacion: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        const Ubicacion = conn.model('Ubicacion')
        Ubicacion.aggregate()
            .lookup({ 
                from: 'ingresos', 
                localField: "_id", 
                foreignField: 'ubicacion', 
                as: 'ingresos' })
            .lookup({ from: 'egresos', localField: "_id", foreignField: 'ubicacion', as: 'egresos' })
            .exec((err, disp)=>{
                conn.close()
                if(err){console.log(err)}
                return res.status(200).send({
                    status: "success",
                    disp
                })
            })
    },
}

module.exports = controller