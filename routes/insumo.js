'use strict'
var express = require('express');
var InsumoController = require('../controllers/insumo');
var router = express.Router();

router.get('/:bd/insumos/:produccion_id', InsumoController.getInsumos);
router.post('/:bd/insumo/save', InsumoController.save);
router.post('/:bd/insumo/delete', InsumoController.delete);

module.exports = router;