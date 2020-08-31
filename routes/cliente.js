'use strict'

var express = require('express');
var ClienteController = require('../controllers/cliente');

var router = express.Router();

//Rutas
router.post('/:bd/cliente/save', ClienteController.save);
router.get('/:bd/clientes', ClienteController.getClientes);
router.get('/:bd/cliente/:id', ClienteController.getCliente);
router.put('/:bd/cliente/:id', ClienteController.update);
router.delete('/:bd/cliente/:id', ClienteController.delete);

module.exports = router;