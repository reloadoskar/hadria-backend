'use strict'

var express = require('express');
var TipoVentaController = require('../controllers/tipoventa');

var router = express.Router();

//Rutas
router.post('/tipoventa/save', TipoVentaController.save);
router.get('/tipoventas', TipoVentaController.getTipoPagos);
router.get('/tipoventa/:id', TipoVentaController.getTipoPago);
router.put('/tipoventa/:id', TipoVentaController.update);
router.delete('/tipoventa/:id', TipoVentaController.delete);

module.exports = router;