'use strict'
const express = require('express');
const app = express();
var bodyParser = require('body-parser')
var cors = require('cors')

//Middlewares
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors())

//cargar rutas
var status_routes = require('./routes/status');
var user_routes = require('./routes/user')

//Usar rutas
app.use('/api', status_routes);
app.use('/api', user_routes);

app.get('/', (req, res) => {
    res.send('Lobby loaded!');
});

module.exports = app;