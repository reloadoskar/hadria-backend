'use strict'

const express = require('express');
const router = express.Router();
const cors = require('cors')

const UserController = require('../controllers/user');

router.use(cors())



//Rutas
router.post('/register', UserController.save);
router.post('/login', UserController.login)
router.get('/profile', UserController.profile)

module.exports = router;