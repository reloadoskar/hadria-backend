'use strict'

var validator = require('validator');
const con = require('../conections/hadriaUser')
// var Producto = require('../models/producto');

var controller = {
    save: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        var Producto = conn.model('Producto',require('../schemas/producto') )
        //recoger parametros
        var params = req.body;

        //validar datos
        try{
            var validate_clave = !validator.isEmpty(params.clave);
            var validate_descripcion = !validator.isEmpty(params.descripcion);
            var validate_costo = !validator.isEmpty(params.costo);
            var validate_precio1 = !validator.isEmpty(params.precio1);
        }catch(err){
            conn.close()
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos.'
            })
        }

        if(validate_clave && validate_descripcion && validate_costo, validate_precio1){
            //Crear el objeto a guardar
            var producto = new Producto();
            
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
                if(err || !productoStored){
                    conn.close()
                    return res.status(200).send({
                        status: 'error',
                        message: 'El producto no se guardó'
                    })
                }
                //Devolver respuesta
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    message: 'Producto guardado correctamente.',
                    producto: productoStored
                })
            })


        }else{
            conn.close()
            return res.status(200).send({
                status: 'error',
                message: 'Datos no validos.'
            })
        }

    },

    getProductos: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        var Producto = conn.model('Producto',require('../schemas/producto') )
        Producto.find({}).sort('clave').exec( (err, productos) => {
            if(err || !productos){
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los productos'
                })
            }
            conn.close()
            return res.status(200).send({
                status: 'success',
                products: productos
            })
        })
    },

    getProducto: (req, res) => {
        var productoId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        var Producto = conn.model('Producto',require('../schemas/producto') )

        if(!productoId){
            conn.close()
            return res.status(404).send({
                status: 'error',
                message: 'No existe el producto'
            })
        }

        Producto.findById(productoId, (err, producto) => {
            if(err || !producto){
                conn.close()
                return res.status(404).send({
                    status: 'success',
                    message: 'No existe el producto.'
                })
            }
            conn.close()
            return res.status(200).send({
                status: 'success',
                producto
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
            conn.close()
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos.'
            })
        }

        if(validate_clave && validate_descripcion && validate_costo, validate_precio1){
            
            // Find and update
            Producto.findOneAndUpdate({_id: productoId}, params, {new:true}, (err, productoUpdated) => {
                if(err){
                    conn.close()
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar'
                    })
                }

                if(!productoUpdated){
                    conn.close()
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el producto'
                    })
                }
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    producto: productoUpdated
                })

            })

        }else{
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
            if(!productoRemoved){
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    message: 'No se pudo borrar el producto.'
                })
            }
            if(err){
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    message: 'Ocurrio un error.'
                })
            }
            conn.close()
            return res.status(200).send({
                status: 'success',
                message: 'Producto eliminado correctamente.',
                productoRemoved
            })
        })

    }

}

module.exports = controller;