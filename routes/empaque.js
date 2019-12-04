'use strict'

var express = require('express');
var EmpaqueController = require('../controllers/empaque');

var router = express.Router();

//Rutas
router.get('/empaques', EmpaqueController.getEmpaques)
router.post('/empaque/save', EmpaqueController.save);
router.delete('/empaque/:id', EmpaqueController.delete)

module.exports = router;