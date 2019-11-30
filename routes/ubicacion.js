'use strict'

var express = require('express');
var UbicacionController = require('../controllers/ubicacion');

var router = express.Router();

//Rutas
router.post('/ubicacion/save', UbicacionController.save);
router.get('/ubicacions', UbicacionController.getUbicacions);
router.get('/ubicacion/:id', UbicacionController.getUbicacion);
router.put('/ubicacion/:id', UbicacionController.update);
router.delete('/ubicacion/:id', UbicacionController.delete);

module.exports = router;