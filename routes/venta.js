'use strict'

var express = require('express');
var VentaController = require('../controllers/venta');

var router = express.Router();

//Rutas
router.post('/venta/save', VentaController.save);
router.get('/ventas', VentaController.getVentas);
router.get('/venta/producto/:id', VentaController.getVentasOfProduct);
router.post('/venta', VentaController.getVenta);
router.delete('/venta/:id', VentaController.cancel);

router.get('/ventas/semana', VentaController.getVentasSemana);

module.exports = router;