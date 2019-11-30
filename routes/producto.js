'use strict'

var express = require('express');
var ProductoController = require('../controllers/producto');

var router = express.Router();

//Rutas
router.post('/producto/save', ProductoController.save);
router.get('/productos', ProductoController.getProductos);
router.get('/producto/:id', ProductoController.getProducto);
router.put('/producto/:id', ProductoController.update);
router.delete('/producto/:id', ProductoController.delete);

module.exports = router;