'use strict'

var express = require('express');
var ClienteController = require('../controllers/cliente');

var router = express.Router();

//Rutas
router.post('/cliente/save', ClienteController.save);
router.get('/clientes', ClienteController.getClientes);
router.get('/cliente/:id', ClienteController.getCliente);
router.put('/cliente/:id', ClienteController.update);
router.delete('/cliente/:id', ClienteController.delete);

module.exports = router;