'use strict'

var express = require('express');
var CorteController = require('../controllers/corte');

var router = express.Router();

//Rutas
// router.get('/corte/ventas/:ubicacion/:fecha', CorteController.getVentas)
router.get('/corte/:ubicacion/:fecha', CorteController.getData)
router.post('/corte/save', CorteController.save)
router.get('/corte/exist/:ubicacion/:fecha', CorteController.exist);
// router.put('/compra/:id', CompraController.update);
// router.delete('/compra/:id', CompraController.delete);

module.exports = router;