'use strict'
const mongodb = require('mongodb');
var mongoose = require('mongoose');
var app = require('./app');
var port = 8080;

mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://localhost:27017/api_rest_hadria', {useNewUrlParser: true, useUnifiedTopology: true})
mongoose.connect('mongodb://34.70.127.109:27017/api_rest_hadria', {useNewUrlParser: true, useUnifiedTopology: true})
    .then( () => {
        console.log('Conectado a la base de datos HOMIE.');

        // Crear servidor
        const server = app.listen(port, () => {
            const host = server.address().address;
            const port = server.address().port;
            console.log('Servidor corriendo en ' + host + ":" + port );
        })
    });