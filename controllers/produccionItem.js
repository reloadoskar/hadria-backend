const con = require('../conections/hadriaUser')
var mongoose = require('mongoose');
var controller = {
    save: (req, res) => {
        //recoger parametros
        var params = req.body;
        const bd = req.params.bd
        const conn = con(bd)
        var Produccion = conn.model('Produccion', require('../schemas/produccion'))
        var ProduccionItem = conn.model('ProduccionItem',require('../schemas/produccionItem') )
        var item = new ProduccionItem()

        item.produccion = params.produccion._id
        item.producto = params.producto._id
        item.insumos = params.insumos
        item.fecha = params.fecha
        item.cantidad = params.cantidad
        item.costo = params.costo
        item.stock = params.cantidad
        item.importe = params.importe


        item.save((err, itemSaved) => {
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: "No se pudo registrar el Producto."
                })
            }
            Produccion.findById(itemSaved.produccion).exec((err, produccion) => {
                if(err || !produccion){
                    console.log("que pedo?")
                    return res.status(500).send({
                        status: 'error',
                        message: "Algo salió mal",
                        insumo: insumoSaved,
                        produccion: produccion
                    })
                }else{
                    // console.log(produccion)
                    produccion.productos.push( itemSaved._id )
                    produccion.save((err, saved) => {                        
                        conn.close()
                        return res.status(200).send({
                            status: 'success',
                            message: "Producto registrado correctamente.",
                            insumo: itemSaved,
                            produccion: saved
                        })
                    })
                }
            })
        })

    },

    getItems: (req, res) => {
        const produccionID = req.params.produccion_id
        const bd = req.params.bd
        const conn = con(bd)

        var ProduccionItem = conn.model('ProduccionItem',require('../schemas/produccionItem') )

        ProduccionItem.find({produccion: produccionID})
            .populate({ path: 'produccion', select: 'clave' })            
            .populate("producto")
            .exec( (err, items) => {
                conn.close()
                if(err || !items){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al devolver los productos' + err
                    })
                }
                return res.status(200).send({
                    status: 'success',
                    items
                })
            } )
    },

    delete: (req, res) => {
        var params = req.body;
        const id = req.body._id
        // console.log(params)
        const prodId = params.produccion._id
        const bd = req.params.bd
        const conn = con(bd)
        var ProduccionItem = conn.model('ProduccionItem',require('../schemas/produccionItem') )
        ProduccionItem.findOneAndDelete({ _id: id }, (err, insumoRemoved) => {
            if(err|| !insumoRemoved){
                console.log(err)
            }
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    message: "Producto eliminado correctamente",
                    insumoRemoved,
                })

        })
    },

    subtract: (req, res) => {
        const bd = req.params.bd
        const params = req.body
        const conn = con(bd)
        var ProduccionItem = conn.model('ProduccionItem', require('../schemas/produccionItem'))
        ProduccionItem.findById(params.id).exec((err, item) => {
            if(err||!item){
                console.log(err)
            }
            item.stock -= params.cantidad

            item.save((err, itemSaved) => {
                conn.close()
                return res.status(200).send({
                    status: "success",
                    item: itemSaved
                })
            })
        })
    },

    // add: (req, res) => {
    //     const bd = req.params.bd
    //     const params = req.body
    //     const conn = con(bd)
    //     var Insumo = conn.model('Insumo', require('../schemas/insumo'))
    //     Insumo.findById(params.id).exec((err, item) => {
    //         if(err||!item){
    //             return res.status(500).send({
    //                 status: "error",
    //             })
    //         }else{
    //             item.cantidad += params.cantidad
    //             item.save((err, itemSaved) => {
    //                 conn.close()
    //                 return res.status(200).send({
    //                     status: "success",
    //                     item: itemSaved
    //                 })
    //             })
    //         }
    //     })
    // }
}

module.exports = controller