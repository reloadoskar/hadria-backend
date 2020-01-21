require('dotenv').config()
var app = require('./app_client');
var mongoose = require('mongoose')
const PORT = process.env.PORT || 8000
mongoose.Promise = global.Promise;
mongoose.connect(process.env.mongoose_URI, {useNewUrlParser: true, useUnifiedTopology: true})

    .then( () => {
        // Crear servidor
        const server = app.listen(PORT, () => {
            console.log('HADRIA IS LISTENING.');
        })
    })
    .catch(err => {
        console.log(err)
    })