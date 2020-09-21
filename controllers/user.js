'use strict'
var mongoose = require('mongoose')

const conexion_app = require('../conections/hadria')
const conexion_cliente = require('../conections/hadriaUser')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

process.env.SECRET_KEY = 'secret'

var controller = {
    save: (req, res) => {
        const conn = conexion_app()
        var User = conn.model('User', require('../schemas/user') );
        //recoger parametros
        const {email, password, nombre, apellido} = req.body;
        //Crear el objeto a guardar

        User.estimatedDocumentCount((err, count) => {
            // .then((err, count) =>{
            if (err) console.log(err)
            const nDocuments = count

            const user = new User();
            user.nombre = nombre
            user.apellido = apellido
            user.email = email
            user.password = password
            user.database = count+1

            User.findOne({
                email: email
            })
            .then(usr => {
                if(!usr){
                    bcrypt.hash(password, 10, (err, hash) => {
                        user.password = hash
                        
                        user.save((err, user) => {
                            if(err || !user) {
                                return res.status(404).send({
                                    status: 'error',
                                    message: "Ocurrio un error",
                                    err
                                })
                            }else{
                                conn.close()
                                return res.status(200).send({
                                    status: 'success',
                                    message:"Registrado.",
                                })
                            }
                
                        })

                    })
                }else{
                    return res.status(200).send({
                        status: 'error',
                        message:"El Usuario ya existe."
                    })
                }
            })
        })
    },

    logout: (req, res) => {
        const conn = conexion_app()
        conn.close()
        return res.status(200).send({
            status: 'success',
            message: "Se cerro la sesión."
        })
    },

    login: (req, res) => {
        const conn = conexion_app()
        var User = conn.model('User', require('../schemas/user') );
        const {email, password} = req.body;
        User.findOne({
            email: email
        })
        .then(user => {
            if(user){
                if(bcrypt.compareSync(password, user.password)){
                    const payload = {
                        _id: user._id,
                        nombre: user.nombre,
                        apellido: user.apellido,
                        email: user.email,
                        database: user.database,
                        level: user.level,
                    }
                    let token = jwt.sign(payload, process.env.SECRET_KEY, {
                        expiresIn: 1440
                    })
                    conn.close()
                    return res.status(200).send({
                        status: 'success',
                        message: 'Bienvenido '+payload.nombre,
                        token
                    })

                }else{
                    return res.status(200).send({
                        status: 'error',
                        message: "El usuario o la contraseña son incorrectos."
                    })
                }
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
        const conn = conexion_app()
        var User = conn.model('User', require('../schemas/user') );
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