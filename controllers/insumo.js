const con = require('../conections/hadriaUser')
var mongoose = require('mongoose');
var controller = {
    save: (req, res) => {
        //recoger parametros
        var params = req.body;
        const bd = req.params.bd
        const conn = con(bd)
        var Insumo = conn.model('Insumo',require('../schemas/insumo') )

        var insumo = new Insumo()

        insumo.fecha = params.fecha
        insumo.produccion = params.produccion._id
        // insumo.ubicacion = params.ubicacion._id
        insumo.compraItem = params.compraItem._id
        insumo.cantidad = params.cantidad
        insumo.importe = params.importe

        insumo.save((err, insumoSaved) => {
            mongoose.connection.close()
            conn.close()
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: "No se pudo registrar el Insumo."
                })
            }
            return res.status(200).send({
                status: 'success',
                message: "Insumo registrado correctamente.",
                insumo: insumoSaved
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
    }
}

module.exports = controller