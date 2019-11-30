'use strict'

var express = require('express');
var ProvedorController = require('../controllers/provedor');

var router = express.Router();

//Rutas
router.post('/provedor/save', ProvedorController.save);
router.get('/provedors', ProvedorController.getProvedors);
router.get('/provedor/:id', ProvedorController.getProvedor);
router.put('/provedor/:id', ProvedorController.update);
router.delete('/provedor/:id', ProvedorController.delete);

module.exports = router;