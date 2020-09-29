const con = require('../conections/hadriaUser')
var mongoose = require('mongoose');
var controller = {

    save: (req, res) => {
        //recoger parametros
        var params = req.body;
        const bd = req.params.bd
        const conn = con(bd)
    },

    getItems: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)

        var CompraItem = conn.model('CompraItem', require('../schemas/compra_item'))
        CompraItem.find({stock: {$gt: 0}})
            .populate("compra")
            .populate("producto")
            .exec((err, items) => {
                conn.close()
                mongoose.connection.close()
                if(err || !items) {
                    return res.status(500).send({
                        status: "error",
                        message: "Error al devolver items"
                    })
                }
                return res.status(200).send({
                    status: "success",
                    items: items
                })
            })
    },

    subtractStock: (req, res) => {
        const bd = req.params.bd
        const params = req.body
        const conn = con(bd)
        var CompraItem = conn.model('CompraItem', require('../schemas/compra_item'))
        CompraItem.findById(params.id).exec((err, item) => {
            if(err||!item){
                console.log(err)
            }
            item.stock -= params.cantidad
            item.empaquesStock -= params.cantidad

            item.save((err, itemSaved) => {
                conn.close()
                mongoose.connection.close()
                return res.status(200).send({
                    status: "success",
                    item: itemSaved
                })
            })
        })
    },

    addStock: (req, res) => {
        const bd = req.params.bd
        const params = req.body
        const conn = con(bd)
        var CompraItem = conn.model('CompraItem', require('../schemas/compra_item'))
        CompraItem.findById(params.id).exec((err, item) => {
            if(err||!item){
                return res.status(500).send({
                    status: "error",
                })
            }else{

                item.stock += params.cantidad
                item.empaquesStock += params.cantidad
                
                item.save((err, itemSaved) => {
                    mongoose.connection.close()
                    conn.close()
                    return res.status(200).send({
                        status: "success",
                        item: itemSaved
                    })
                })
            }
        })
    }
}

module.exports = controller