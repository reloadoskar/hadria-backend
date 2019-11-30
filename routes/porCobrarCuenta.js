'use strict'

var express = require('express');
var PccController = require('../controllers/porCobrarCuenta');

var router = express.Router();

//Rutas
router.get('/cuentasporcobrar', PccController.getCuentas);
router.post('/cuentasporcobrar/pago/save', PccController.savePago);
// router.get('/pcc/:id', PccController.getCliente);
// router.put('/pcc/:id', PccController.update);
// router.delete('/pcc/:id', PccController.delete);

module.exports = router;