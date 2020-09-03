'use strict'

var express = require('express');
var Inventario = require('../controllers/inventario');

var router = express.Router();

//Rutas
router.get('/:bd/inventario', Inventario.getInventario);
router.get('/:bd/inventario/:ubicacion', Inventario.getInventarioBy);

module.exports = router;
