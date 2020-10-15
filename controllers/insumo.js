const con = require('../conections/hadriaUser')
var mongoose = require('mongoose');
var controller = {
    save: (req, res) => {
        //recoger parametros
        var params = req.body;
        const bd = req.params.bd
        const conn = con(bd)
        var Insumo = conn.model('Insumo',require('../schemas/insumo') )
        var Produccion = conn.model('Produccion', require('../schemas/produccion'))
        var insumo = new Insumo()

        insumo.fecha = params.fecha
        insumo.produccion = params.produccion
        // insumo.ubicacion = params.ubicacion._id
        insumo.compraItem = params.compraItem._id
        insumo.cantidad = params.cantidad
        insumo.disponible = params.cantidad
        insumo.importe = params.importe

        insumo.save((err, insumoSaved) => {
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: "No se pudo registrar el Insumo."
                })
            }
            Produccion.findById(insumoSaved.produccion).exec((err, produccion) => {
                if(err || !produccion){
                    console.log("que pedo?")
                    return res.status(500).send({
                        status: 'error',
                        message: "Algo salió mal",
                        insumo: insumoSaved,
                        produccion: produccion
                    })
                }else{
                    console.log(produccion)
                    produccion.insumos.push( insumoSaved._id )
                    produccion.save((err, saved) => {
                        mongoose.connection.close()
                        conn.close()
                        return res.status(200).send({
                            status: 'success',
                            message: "Insumo registrado correctamente.",
                            insumo: insumoSaved,
                            produccion: saved
                        })
                    })
                }
            })
        })

    },

    getInsumos: (req, res) => {
        const produccionID = req.params.produccion_id
        const bd = req.params.bd
        const conn = con(bd)

        var Insumo = conn.model('Insumo',require('../schemas/insumo') )

        Insumo.find({produccion: produccionID})
            .populate({ path: 'produccion', select: 'clave' })            
            .populate({ path: 'compraItem', populate: 'producto' })
            .exec( (err, insumos) => {
                mongoose.connection.close()
                conn.close()
                if(err || !insumos){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al devolver los insumos' + err
                    })
                }
                return res.status(200).send({
                    status: 'success',
                    insumos
                })
            } )

    },

    delete: (req, res) => {
        const id = req.body._id
        const bd = req.params.bd
        const conn = con(bd)
        var Insumo = conn.model('Insumo',require('../schemas/insumo') )

        Insumo.findOneAndDelete({ _id: id }, (err, insumoRemoved) => {
            mongoose.connection.close()
            conn.close()
            if(err|| !insumoRemoved){
                console.log(err)
            }
            return res.status(200).send({
                status: 'success',
                message: "Insumo eliminado correctamente",
                insumoRemoved
            })
        })
    },

    subtract: (req, res) => {
        const bd = req.params.bd
        const params = req.body
        const conn = con(bd)
        var Insumo = conn.model('Insumo', require('../schemas/insumo'))
        Insumo.findById(params.id).exec((err, item) => {
            if(err||!item){
                console.log(err)
            }
            item.disponible -= params.cantidad

            item.save((err, itemSaved) => {
                conn.close()
                return res.status(200).send({
                    status: "success",
                    item: itemSaved
                })
            })
        })
    },

    add: (req, res) => {
        const bd = req.params.bd
        const params = req.body
        const conn = con(bd)
        var Insumo = conn.model('Insumo', require('../schemas/insumo'))
        Insumo.findById(params.id).exec((err, item) => {
            if(err||!item){
                return res.status(500).send({
                    status: "error",
                    err
                })
            }else{
                var actual = parseInt(item.disponible)
                var cant = parseInt(params.cantidad)
                
                item.disponible = actual += cant
                
                item.save((err, itemSaved) => {
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