'use strict'

var express = require('express');
var ConceptoController = require('../controllers/concepto');

var router = express.Router();

//Rutas
router.get('/conceptos', ConceptoController.getConceptos)
router.post('/concepto/save', ConceptoController.save);
router.delete('/concepto/:id', ConceptoController.delete)

module.exports = router;