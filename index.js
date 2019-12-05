'use strict'
var mongoose = require('mongoose');
var app = require('./app');
var port = 8080;

mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://34.70.127.109:27017/api_rest_hadria', {useNewUrlParser: true, useUnifiedTopology: true})
    .then( () => {
        console.log('WELCOME HOMIE!');
        // Crear servidor
        const server = app.listen(port, () => {
            const host = server.address().address;
            const port = server.address().port;
            console.log('Servidor corriendo en ' + host + ":" + port );
        })
    .catch(err => console.log(err))
    });