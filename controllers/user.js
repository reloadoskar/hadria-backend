'use strict'
// var app = require('../app');
// var app = require('../app_client')
var mongoose = require('mongoose')
// const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
var User = require('../models/user');

process.env.SECRET_KEY = 'secret'

var controller = {
    save: (req, res) => {
        //recoger parametros
        const {email, password, nombre, apellido} = req.body;
        //Crear el objeto a guardar
        const user = new User();
        user.nombre = nombre
        user.apellido = apellido
        user.email = email
        user.password = password
        user.database = email + "_hadria_db"

        User.findOne({
            email: email
        })
        .then(usr => {
            if(!usr){
                // bcrypt.hash(password, 10, (err, hash) => {
                //     user.password = hash
                    
                //     user.save((err, user) => {
                //         if(err || !user) {
                //             return res.status(404).send({
                //                 status: 'error',
                //                 message: "Ocurrio un error",
                //                 err
                //             })
                //         }else{
                //             return res.status(200).send({
                //                 status: 'success',
                //                 message:"Registrado.",
                //             })
                //         }
            
                //     })

                // })
            }else{
                return res.status(200).send({
                    status: 'error',
                    message:"El Usuario ya existe."
                })
            }
        })

    },

    login: (req, res) => {
        const {email, password} = req.body;
        User.findOne({
            email: email
        })
        .then(user => {
            if(user){
                // if(bcrypt.compareSync(password, user.password)){
                //     const payload = {
                //         _id: user._id,
                //         nombre: user.nombre,
                //         apellido: user.apellido,
                //         email: user.email,
                //         database: user.database,
                //         level: user.level,
                //     }
                //     let token = jwt.sign(payload, process.env.SECRET_KEY, {
                //         expiresIn: 1440
                //     })

                //     var db_client = "mongodb://127.0.0.1:27017/"+user.database
                //     var port = 8080;
                //     console.log(db_client)
                //     const options = {
                //         useNewUrlParser: true,
                //         autoIndex: false, // Don't build indexes
                //         reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
                //         reconnectInterval: 500, // Reconnect every 500ms
                //         poolSize: 4, // Maintain up to 10 socket connections
                //         // If not connected, return errors immediately rather than waiting for reconnect
                //         bufferMaxEntries: 0,
                //         connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
                //         socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
                //         family: 4 // Use IPv4, skip trying IPv6
                //       };
                //     // const conn = mongoose.createConnection(db_client, options);

                //     // const conn = mongoose.createConnection(db_client, {useNewUrlParser: true, useUnifiedTopology: true})
                //     return res.status(200).send({
                //         status: 'success',
                //         message: 'Bienvenido '+payload.nombre,
                //         token
                //     })
                //     // .then( () => {
                //     //     console.log('WELCOME AGAIN!');
                //     //     return res.status(200).send({
                //     //         status: 'success',
                //     //         message: 'Bienvenido '+payload.nombre,
                //     //         token
                //     //     })
                //     // })
                //     // .catch(err => {
                //     //     console.log(err)
                //     // })

                // }else{
                //     return res.status(200).send({
                //         status: 'error',
                //         message: "El usuario o la contraseña son incorrectos."
                //     })
                // }
            }else{
                return res.status(200).send({
                    status: 'error',
                    message: "El usuario no existe."
                })
            }
        })
        .catch(err => {
            res.send('err' + err)
        })
    },

    profile: (req, res) => {
        var decoded = jwt.verify(req.headers['authorization'], process.env.SECRET_KEY)

        User.findOne({
            _id: decoded._id
        })
        .then(user => {
            if(user){
                res.send({
                    message: "success",
                    user
                })
            }else{
                res.send({ message: "El usuario no existe."})
            }
        })
        .catch(err => {
            res.send({'error': err})
        })
    },

}

module.exports = controller;