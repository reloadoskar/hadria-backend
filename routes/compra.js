'use strict'

var express = require('express');
var CompraController = require('../controllers/compra');

var router = express.Router();

//Rutas
router.post('/compra/save', CompraController.save);
router.post('/compra/additem', CompraController.addCompraItem);
router.get('/compras', CompraController.getCompras);
router.get('/compras/dash', CompraController.getComprasDash);
router.get('/compra/:id', CompraController.getCompra);
router.put('/compra/:id', CompraController.close);
router.put('/update/compra/:id', CompraController.update);
router.put('/compra/item/:id', CompraController.updateCompraItem);
router.delete('/compra/:id', CompraController.delete);

module.exports = router;