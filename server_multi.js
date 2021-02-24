require('dotenv').config()
var app = require('./app');
var mongoose = require('mongoose')
const PORT = process.env.PORT || 8000
mongoose.Promise = global.Promise;

const server = app.listen(PORT, () => {
    console.log('H A D R I A  ESTÁ ESCUCHANDO EN EL PUERTO: '+PORT);
    console.log("Running in :"  + process.env.NODE_ENV);
})

process.on('SIGINT', function(){
    mongoose.connection.close(function(){
      console.log("Saliendo de HADRIA")
      process.exit(0)
    })
})

process.on('uncaughtException', err => {
  console.log(`Uncaught Exception: ${err.message}`)
  process.exit(1)
})