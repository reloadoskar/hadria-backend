'use strict'

var validator = require('validator');
var Cliente = require('../models/cliente');

var controller = {
    save: (req, res) => {
        //recoger parametros
        var params = req.body;

        //Crear el objeto a guardar
        var cliente = new Cliente();

        //Asignar valores
        cliente.nombre = params.nombre;
        cliente.direccion = params.direccion;
        cliente.rfc = params.rfc;
        cliente.tel1 = params.tel1;
        cliente.email = params.email;
        cliente.limite_de_credito = params.limiteDeCredito;
        cliente.credito_disponible = params.limiteDeCredito;
        cliente.dias_de_credito = params.diasDeCredito;

        //Guardar objeto
        cliente.save((err, clienteStored) => {
            if (err || !clienteStored) {
                return res.status(404).send({
                    status: 'error',
                    message: 'El cliente no se guardó',
                    err: err
                })
            }
            //Devolver respuesta
            return res.status(200).send({
                status: 'success',
                message: 'Cliente guardado correctamente.',
                cliente: clienteStored
            })
        })

    },

    getClientes: (req, res) => {
        Cliente.find({}).sort('_id').exec((err, clientes) => {
            if (err || !clientes) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los clientes'
                })
            }

            return res.status(200).send({
                status: 'success',
                message: 'Ok',
                clientes
            })
        })
    },

    getCliente: (req, res) => {
        var clienteId = req.params.id;

        if (!clienteId) {
            return res.status(404).send({
                status: 'error',
                message: 'No existe el cliente'
            })
        }

        Cliente.findById(clienteId, (err, cliente) => {
            if (err || !cliente) {
                return res.status(404).send({
                    status: 'success',
                    message: 'No existe el cliente.'
                })
            }
            return res.status(200).send({
                status: 'success',
                cliente
            })
        })
    },

    update: (req, res) => {
        var clienteId = req.params.id;

        //recoger datos actualizados y validarlos
        var params = req.body;
        try {
            var validate_nombre = !validator.isEmpty(params.nombre);
            var validate_direccion = !validator.isEmpty(params.direccion);
            var validate_tel1 = !validator.isEmpty(params.tel1);
            var validate_limite = !validator.isEmpty(params.limite_de_credito);
        } catch (err) {
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos.'
            })
        }

        if (validate_nombre && validate_direccion && validate_tel1, validate_limite) {

            // Find and update
            Cliente.findOneAndUpdate({ _id: clienteId }, params, { new: true }, (err, clienteUpdated) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar'
                    })
                }

                if (!clienteUpdated) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el cliente'
                    })
                }

                return res.status(200).send({
                    status: 'success',
                    cliente: clienteUpdated
                })

            })

        } else {
            return res.status(200).send({
                status: 'error',
                message: 'Datos no validos.'
            })
        }

    },

    delete: (req, res) => {
        var clienteId = req.params.id;

        Cliente.findOneAndDelete({ _id: clienteId }, (err, clienteRemoved) => {
            if (!clienteRemoved) {
                return res.status(500).send({
                    status: 'error',
                    message: 'No se pudo borrar el cliente.'
                })
            }
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Ocurrio un error.'
                })
            }

            return res.status(200).send({
                status: 'success',
                message: 'Cliente eliminado correctamente.',
                clienteRemoved
            })
        })

    }

}

module.exports = controller;