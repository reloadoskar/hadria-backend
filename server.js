require('dotenv').config()
var app = require('./app');
var mongoose = require('mongoose')
const PORT = process.env.PORT || 8000
mongoose.Promise = global.Promise;
mongoose.connect('mongodb+srv://reloadoskar:MuffinTop100685@hdra1-qllhk.mongodb.net/DB_HADRIA2_ANGY?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true})

    .then( () => {
        // Crear servidor
        const server = app.listen(PORT, () => {
            console.log('HADRIA IS LISTENING.');
        })
    })
    .catch(err => {
        console.log(err)
    })