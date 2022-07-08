'use strict'
const con = require('../conections/hadriaUser')

const controller = {
    save: (req, res) => {
        //recoger parametros
        const params = req.body;
        const bd = req.params.bd
        const conn = con(bd)
        const Cliente = conn.model('Cliente')

        //Crear el objeto a guardar
        let cliente = new Cliente();

        //Asignar valores
        cliente.nombre = params.nombre;
        cliente.direccion = params.direccion;
        cliente.ubicacion = params.ubicacion;
        cliente.rfc = params.rfc;
        cliente.tel1 = params.tel1;
        cliente.email = params.email;
        cliente.limite_de_credito = params.limite_de_credito;
        cliente.credito_disponible = params.limite_de_credito;
        cliente.dias_de_credito = params.dias_de_credito;

        //Guardar objeto
        cliente.save((err, clienteStored) => {
            conn.close()
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

    getClientes: async (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        const Cliente = conn.model('Cliente')
        
        const resp = await Cliente.find({})
            .sort('createdAt')
            .lean()
            .then((clientes) => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    message: 'Ok',
                    clientes
                })
            })
            .catch(err => {
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los clientes',
                    err
                })
            })
    },

    getCliente: async (req, res) => {
        const clienteId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        const Cliente = conn.model('Cliente')
        if (!clienteId) {
            return res.status(404).send({
                status: 'error',
                message: 'No existe el cliente'
            })
        }
        
        const resp = await Cliente.findById(clienteId)
            .lean()
            .then(cliente => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    cliente
                })
            })
            .catch(err => { 
                conn.close()               
                if (err || !cliente) {
                    return res.status(404).send({
                        status: 'success',
                        message: 'No existe el cliente.'
                    })
                }
            }) 
    },

    update: async (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        const params = req.body;
        
        const Cliente = conn.model('Cliente')

            // Find and update
        const resp = await Cliente
            .findByIdAndUpdate(params._id , params, { new: true } )
            .then( updatd => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    message: "Actualizado correctamente",
                    cliente: updatd
                })
            })
            .catch(err => {
                conn.close()
                return res.status(200).send({
                    status: 'error',
                    message: "No se pudo actualizar " + err
                })
            })                
    },

    delete: async (req, res) => {
        const clienteId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        const Cliente = conn.model('Cliente')
        const resp = await Cliente
            .findOneAndDelete({ _id: clienteId }, (err, clienteRemoved) => {
                conn.close()
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