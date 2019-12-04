'use strict'

var express = require('express');
var UnidadController = require('../controllers/unidad');

var router = express.Router();

//Rutas
router.post('/unidad/save', UnidadController.save);
router.get('/unidads', UnidadController.getUnidades);
router.delete('/unidad/:id', UnidadController.delete)

module.exports = router;