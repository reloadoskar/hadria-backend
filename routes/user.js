'use strict'

var express = require('express');
var UserController = require('../controllers/user');

var router = express.Router();

//Rutas
router.post('/user/save', UserController.save);

module.exports = router;