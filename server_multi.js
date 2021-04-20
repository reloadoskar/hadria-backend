require('dotenv').config()
var app = require('./app');
var mongoose = require('mongoose')
const PORT = process.env.PORT || 8000
mongoose.Promise = global.Promise;

const server = app.listen(PORT, () => {
    console.log('H A D R I A  ESTÁ ESCUCHANDO EN EL PUERTO: '+PORT);
    console.log("Running in :"  + process.env.NODE_ENV);
})