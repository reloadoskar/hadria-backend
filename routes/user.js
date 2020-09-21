'use strict'

const express = require('express');
const router = express.Router();
const cors = require('cors')

const UserController = require('../controllers/user');

router.use(cors())



//Rutas
router.post('/client/register', UserController.save);
router.post('/user/login', UserController.login)
router.get('/profile', UserController.profile)
router.get('/logout', UserController.logout)

module.exports = router;