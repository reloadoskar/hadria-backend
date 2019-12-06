var app = require('./app');
var mongoose = require('mongoose')
var port = 8080;

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://34.70.127.109:27017/hadria_angy', {useNewUrlParser: true, useUnifiedTopology: true})
    .then( () => {
        console.log('WELCOME HOMIE!');
        // Crear servidor
        app.listen(port, () => {    
            console.log('Servidor corriendo en puerto:' + port );
        })
      })