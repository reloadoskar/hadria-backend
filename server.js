 var app = require('./app_client');
var mongoose = require('mongoose')
const PORT = process.env.PORT || 8000

mongoose.Promise = global.Promise;
mongoose.connect('mongodb+srv://reloadoskar:MuffinTop100685@hdra1-qllhk.mongodb.net/DB_HADRIA2_ANGY?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true})
// mongoose.connect('mongodb://127.0.0.1:27017/hadria_pruebas_1', {useNewUrlParser: true, useUnifiedTopology: true})
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