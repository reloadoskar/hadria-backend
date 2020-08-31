'use strict'

var express = require('express');
var PpcController = require('../controllers/porPagarCuenta');

var router = express.Router();

//Rutas
router.get('/:bd/cuentasporpagar', PpcController.getCuentas);
router.post('/cuentasporpagar/pago/save', PpcController.savePago);
// router.get('/ppc/:id', PpcController.getCliente);
// router.put('/ppc/:id', PpcController.update);
// router.delete('/ppc/:id', PpcController.delete);

module.exports = router;