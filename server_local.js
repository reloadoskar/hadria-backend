require('dotenv').config()
var app = require('./app');
var mongoose = require('mongoose')
const PORT = process.env.PORT || 8000
mongoose.Promise = global.Promise;

// const conn = require('./conections/hadria')
// mongoose.connect('mongodb+srv://reloadoskar:MuffinTop100685@hdra1-qllhk.mongodb.net/DB_HADRIA_LOBBY?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true})
//     .then( () => {
//         // Crear servidor
//         const server = app.listen(PORT, () => {
//             console.log('BIENVENIDO, ESTÁS EN EL LOBBY.');
//         })
//     })
//     .catch(err => {
//         console.log(err)
//     })

const server = app.listen(PORT, () => {
    console.log('H A D R I A  ESTÁ ESCUCHANDO.');
})