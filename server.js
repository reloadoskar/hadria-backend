var app = require('./app');
var mongoose = require('mongoose')
var port = 8080;

mongoose.Promise = global.Promise;
mongoose.connect('mongodb+srv://reloadoskar:MuffinTop100685@hdra1-qllhk.mongodb.net/DB_HADRIA2_ANGY?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true})
// mongoose.connect('mongodb://127.0.0.1:27017/hadria_Copy_ANGY_1', {useNewUrlParser: true, useUnifiedTopology: true})
// mongoose.connect('mongodb://34.70.127.109:27017/hadria_angy', {useNewUrlParser: true, useUnifiedTopology: true})
    .then( () => {
        console.log('WELCOME HOMIE!');
        // Crear servidor
        const server = app.listen(port, () => {
            const host = server.address().address;
            const port = server.address().port;
            console.log('Servidor corriendo en ' + host + ":" + port );
        })

      })