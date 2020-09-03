'use strict'

var express = require('express');
var Egreso = require('../controllers/egreso');

var router = express.Router();

//Rutas
router.post('/:bd/egreso/save', Egreso.save);
router.get('/:bd/egresos', Egreso.getEgresos);
router.get('/:bd/egreso/:id', Egreso.getEgreso);
// router.put('/egreso/:id', Egreso.update);
router.delete('/:bd/egreso/:id', Egreso.delete);

module.exports = router;
