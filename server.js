 var app = require('./app_client');
var mongoose = require('mongoose')
const PORT = process.env.PORT || 8000

mongoose.Promise = global.Promise;
mongoose.connect('mongodb//reloadoskar:MuffinTop100685@hdra1-00-00-qllhk.mongodb.net:27017/DB_HADRIA2_ANGY?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true})
// mongoose.connect('mongodb://127.0.0.1:27017/hadria_COPIA_1', {useNewUrlParser: true, useUnifiedTopology: true})
// mongoose.connect('mongodb://34.70.127.109:27017/hadria_angy', {useNewUrlParser: true, useUnifiedTopology: true})
    .then( () => {
        // Crear servidor
        const server = app.listen(PORT, () => {
            console.log('HADRIA IS LISTENING HOMIE!!!!');
        })
    })
    .catch(err => {
        console.log(err)
    })