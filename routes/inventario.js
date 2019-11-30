'use strict'

var express = require('express');
var Inventario = require('../controllers/inventario');

var router = express.Router();

//Rutas
router.get('/inventario', Inventario.getInventario);
router.get('/inventario/:ubicacion', Inventario.getInventarioBy);

module.exports = router;
