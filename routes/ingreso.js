'use strict'

var express = require('express');
var Ingreso = require('../controllers/ingreso');

var router = express.Router();

//Rutas
router.post('/:bd/ingreso/save', Ingreso.save);
router.get('/:bd/ingresos/:fecha', Ingreso.getIngresosDelDia);
// router.get('/:bd/ingresos/:year/:month', Ingreso.getIngresosDelDia);
// router.get('/:bd/ingresos/recuperarclientes', Ingreso.getRecuperarClientes);
router.get('/:bd/ingresos/cuentas/clientes', Ingreso.getCuentasClientes);
// router.put('/ingreso/:id', Ingreso.update);
router.delete('/:bd/ingreso/:id', Ingreso.delete);

module.exports = router;
