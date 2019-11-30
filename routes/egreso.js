'use strict'

var express = require('express');
var Egreso = require('../controllers/egreso');

var router = express.Router();

//Rutas
router.post('/egreso/save', Egreso.save);
router.get('/egresos', Egreso.getEgresos);
router.get('/egreso/:id', Egreso.getEgreso);
// router.put('/egreso/:id', Egreso.update);
router.delete('/egreso/:id', Egreso.delete);

module.exports = router;
