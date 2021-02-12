require('dotenv').config()
var app = require('./app');
var mongoose = require('mongoose')
const PORT = process.env.PORT || 8000
mongoose.Promise = global.Promise;

const server = app.listen(PORT, () => {
    console.log('H A D R I A  ESTÁ ESCUCHANDO EN EL PUERTO: '+PORT);
})

process.on('SIGINT', function(){
    mongoose.connection.close(function(){
      console.log(termination("Mongoose default connection is disconnected due to application termination"))
      process.exit(0)
    })
})