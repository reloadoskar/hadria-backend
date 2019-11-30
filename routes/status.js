'use strict'

var express = require('express');
var StatusController = require('../controllers/status');

var router = express.Router();

//Rutas
router.post('/status/save', StatusController.save);
router.get('/status', StatusController.getStatuss);
router.get('/status/:id', StatusController.getStatus);
router.put('/status/:id', StatusController.update);
router.delete('/status/:id', StatusController.delete);

module.exports = router;