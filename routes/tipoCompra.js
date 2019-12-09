'use strict'

var express = require('express');
var TipoCompraController = require('../controllers/tipoCompra');

var router = express.Router();

//Rutas
router.post('/tipocompra/save', TipoCompraController.save);
router.get('/tipocompras', TipoCompraController.getTipoCompras);
router.get('/tipocompra/:id', TipoCompraController.getTipoCompra);
router.put('/tipocompra/:id', TipoCompraController.update);
router.delete('/tipocompra/:id', TipoCompraController.delete);

module.exports = router;