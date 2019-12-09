'use strict'

var express = require('express');
var TipoPagoController = require('../controllers/tipoPago');

var router = express.Router();

//Rutas
router.post('/tipopago/save', TipoPagoController.save);
router.get('/tipopagos', TipoPagoController.getTipoPagos);
router.get('/tipopago/:id', TipoPagoController.getTipoPago);
router.put('/tipopago/:id', TipoPagoController.update);
router.delete('/tipopago/:id', TipoPagoController.delete);

module.exports = router;