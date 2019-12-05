'use strict'
const bcrypt = require('bcrypt')
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
                bcrypt.hash(password, 10, (err, hash) => {
                    user.password = hash
                    
                    user.save((err, user) => {
                        if(err || !user) {
                            return res.status(404).send({
                                message: "Ocurrio un error",
                                err
                            })
                        }else{
                            return res.status(200).send({
                                message:"Registrado.",
                            })
                        }
            
                    })

                })
            }else{
                return res.status(400).send({
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
                if(bcrypt.compareSync(password, user.password)){
                    const payload = {
                        _id: user._id,
                        nombre: user.nombre,
                        apellido: user.apellido,
                        email: user.email,
                        database: user.database
                    }
                    let token = jwt.sign(payload, process.env.SECRET_KEY, {
                        expiresIn: 1440
                    })

                    res.send(token)
                }else{
                    res.json({error: "El usuario o la contraseña son incorrectos."})
                }
            }else{
                res.json({error: "El usuario no existe."})
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
                res.json(user)
            }else{
                res.send("El usuario no existe.")
            }
        })
        .catch(err => {
            res.send({'error': err})
        })
    },

}

module.exports = controller;