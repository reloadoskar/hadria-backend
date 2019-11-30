'use strict'
var User = require('../models/user');

var controller = {
    save: (req, res) => {
        //recoger parametros
        const {email, password} = req.body;
        //Crear el objeto a guardar
        const user = new User();
        user.email = email
        user.password = password
        user.save((err, user) => {
            if(err || !user) {
                return res.status(404).send({
                    message: "Ocurrio un error",
                    err
                })
            }else{
                return res.status(200).send({
                    message:"Bienvenido.",
                    user
                })
            }

        })
    },

}

module.exports = controller;