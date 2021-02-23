'use strict'
var mongoose = require('mongoose');
var validator = require('validator');
const con = require('../conections/hadriaUser')

var controller = {
    save: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        const params = req.body;
        const Producto = conn.model('Producto')

        let producto = new Producto();
            
            //Asignar valores
            producto.clave = params.clave.toUpperCase();
            producto.descripcion = params.descripcion.toUpperCase();
            producto.costo = params.costo;
            producto.unidad = params.unidad;
            producto.empaque = params.empaque;
            producto.precio1 = params.precio1;
            producto.precio2 = params.precio2;
            producto.precio3 = params.precio3;

            //Guardar objeto
            producto.save((err, productoStored) => {
                mongoose.connection.close()
                conn.close()
                if(err || !productoStored){
                    return res.status(200).send({
                        status: 'error',
                        message: 'El producto no se guardó'
                    })
                }
                return res.status(200).send({
                    status: 'success',
                    message: 'Producto guardado correctamente.',
                    producto: productoStored
                })
            })

    },

    getProductos: async (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        const Producto = conn.model('Producto')
        const resp = await Producto
            .find({})
            .sort('clave')
            .lean()
            .then( productos => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    products: productos
                })
            })
            .catch(err => {
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los productos',
                    err
                })
            })
    },

    getProducto: async (req, res) => {
        const productoId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        const Producto = conn.model('Producto')
        if(!productoId){
            mongoose.connection.close()
            conn.close()
            return res.status(404).send({
                status: 'error',
                message: 'No existe el producto'
            })
        }
        const resp = await Producto
            .findById(productoId)
            .lean()
            .then( producto => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    producto
                })
            })
            .catch(err => {
                return res.status(404).send({
                    status: 'success',
                    mesage: 'No existe el producto.',
                    err
                })
            })        
    },

    update: (req, res) => {
        var productoId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        var Producto = conn.model('Producto',require('../schemas/producto') )
        
        //recoger datos actualizados y validarlos
        var params = req.body;
        try{
            var validate_clave = !validator.isEmpty(params.clave);
            var validate_descripcion = !validator.isEmpty(params.descripcion);
            var validate_costo = !validator.isEmpty(params.costo);
            var validate_precio1 = !validator.isEmpty(params.precio1);
        }catch(err){
            mongoose.connection.close()
            conn.close()
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos.'
            })
        }

        if(validate_clave && validate_descripcion && validate_costo, validate_precio1){
            
            // Find and update
            Producto.findOneAndUpdate({_id: productoId}, params, {new:true}, (err, productoUpdated) => {
                mongoose.connection.close()
                conn.close()
                if(err){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar'
                    })
                }

                if(!productoUpdated){
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el producto'
                    })
                }
                return res.status(200).send({
                    status: 'success',
                    producto: productoUpdated
                })

            })

        }else{
            mongoose.connection.close()
            conn.close()
            return res.status(200).send({
                status: 'error',
                message: 'Datos no validos.'
            })
        }

    },

    delete: (req, res) => {
        var productoId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        var Producto = conn.model('Producto',require('../schemas/producto') )
        Producto.findOneAndDelete({_id: productoId}, (err, productoRemoved) => {
            mongoose.connection.close()
            conn.close()
            if(!productoRemoved){
                return res.status(500).send({
                    status: 'error',
                    message: 'No se pudo borrar el producto.'
                })
            }
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Ocurrio un error.'
                })
            }
            return res.status(200).send({
                status: 'success',
                message: 'Producto eliminado correctamente.',
                productoRemoved
            })
        })

    }

}

module.exports = controller;