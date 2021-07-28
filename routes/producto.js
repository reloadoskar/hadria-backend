'use strict'

var express = require('express');
var ProductoController = require('../controllers/producto');

var router = express.Router();

//Rutas
router.post('/:bd/producto/save', ProductoController.save);
router.get('/:bd/productos', ProductoController.getProductos);
router.get('/:bd/producto/:id', ProductoController.getProducto);
router.put('/:bd/producto/update/:id', ProductoController.update);
router.delete('/:bd/producto/:id', ProductoController.delete);

module.exports = router;