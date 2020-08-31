'use strict'

var express = require('express');
var ProduccionController = require('../controllers/produccion');

var router = express.Router();

//Rutas
router.get('/produccion/save', ProduccionController.save);
router.get('/:bd/produccions', ProduccionController.getProduccions);
router.get('/produccion/:id', ProduccionController.getProduccion);
router.put('/produccion/:id', ProduccionController.update);
router.delete('/produccion/:id', ProduccionController.delete);

module.exports = router;