'use strict'

var express = require('express');
var Ingreso = require('../controllers/ingreso');

var router = express.Router();

//Rutas
router.post('/:bd/ingreso/save', Ingreso.save);
// router.get('/ingresos', Ingreso.getIngresos);
// router.get('/ingreso/:id', Ingreso.getingreso);
// router.put('/ingreso/:id', Ingreso.update);
// router.delete('/ingreso/:id', Ingreso.delete);

module.exports = router;
