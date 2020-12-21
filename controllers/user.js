'use strict'
var mongoose = require('mongoose')

const conexion_app = require('../conections/hadria')
const con = require('../conections/hadriaUser')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

process.env.SECRET_KEY = 'secret'

var controller = {
    save: (req, res) => {
        const curDateISO = new Date().toISOString()
        const {email, password, nombre, apellido} = req.body;
        const conn = conexion_app()
        var User = conn.model('User', require('../schemas/user') );
        
        User.estimatedDocumentCount((err, count) => {
            if (err) console.log(err)
            const user = new User();
            user.nombre = nombre
            user.apellido = apellido
            user.email = email
            user.password = password
            user.database = count+1
            user.fechaInicio = curDateISO
            user.tryPeriodEnds = curDateISO
            user.paydPeriodEnds = curDateISO

            User.findOne({
                email: email
            })
            .then(usr => {
                if(!usr){
                    bcrypt.hash(password, 10, (err, hash) => {
                        user.password = hash
                        
                        user.save((err, user) => {
                            conn.close()
                            mongoose.connection.close()
                            if(err || !user) {
                                return res.status(404).send({
                                    status: 'error',
                                    message: "Ocurrio un error",
                                    err
                                })
                            }else{
                                return res.status(200).send({
                                    status: 'success',
                                    message:"Registrado.",
                                })
                            }
                
                        })

                    })
                }else{
                    mongoose.connection.close()
                    conn.close()
                    return res.status(200).send({
                        status: 'error',
                        message:"El Usuario ya existe."
                    })
                }
            })
        })
    },

    logout: (req, res) => {
        mongoose.connection.close()
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
            mongoose.connection.close()
            conn.close()
            if(user){
                if(bcrypt.compareSync(password, user.password)){
                    const payload = {
                        _id: user._id,
                        nombre: user.nombre,
                        apellido: user.apellido,
                        email: user.email,
                        database: user.database,
                        level: user.level,
                        tryPeriodEnds: user.tryPeriodEnds,
                        paidPeriodEnds: user.paidPeriodEnds,
                    }
                    let token = jwt.sign(payload, process.env.SECRET_KEY, {
                        expiresIn: 1440
                    })
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
            conn.close()
            mongoose.connection.close()
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

    restartApp: (req, res) => {
        const bd= req.params.bd
        const conn = con(bd)
        const Cliente = conn.model('Cliente')
        const CompraItem = conn.model('CompraItem')
        const Compra = conn.model('Compra')
        const Corte = conn.model('Corte')
        const Egreso = conn.model('Egreso')
        const Ingreso = conn.model('Ingreso')
        const Insumo = conn.model('Insumo')
        const ProduccionItem = conn.model('ProduccionItem')
        const Produccion = conn.model('Produccion')
        const Producto = conn.model('Producto')
        const Provedor = conn.model('Provedor')
        const Ubicacion = conn.model('Ubicacion')
        const Venta = conn.model('Venta')
        const VentaItem = conn.model('VentaItem')
        
        // Cliente.deleteMany({}).exec((err, docs) => {
        //     if(err){console.log(err)}
        //     console.log("Cliente - vaciado")
        // })
        CompraItem.deleteMany({}).exec((err, docs) => {
            if(err){console.log(err)}
            console.log("Compra items - vaciado")
        })
        Compra.deleteMany({}).exec((err, docs)=> {
            if(err){console.log(err)}
            console.log("Compra - vaciado")
        })
        // Corte.deleteMany({}).exec((err, docs)=> {
        //     if(err){console.log(err)}
        //     console.log("Corte - vaciado")
        // })
        Egreso.deleteMany({}).exec((err, docs)=> {
            if(err){console.log(err)}
            console.log("Egreso - vaciado")
        })
        Ingreso.deleteMany({}).exec((err, docs)=> {
            if(err){console.log(err)}
            console.log("Ingreso - vaciado")
        })
        // Insumo.deleteMany({}).exec((err, docs)=> {
        //     if(err){console.log(err)}
        //     console.log("Insumo - vaciado")
        // })
        // ProduccionItem.deleteMany({}).exec((err, docs)=> {
        //     if(err){console.log(err)}
        //     console.log("ProduccionItem - vaciado")
        // })
        // Produccion.deleteMany({}).exec((err, docs)=> {
        //     if(err){console.log(err)}
        //     console.log("Produccion - vaciado")
        // })
        // Producto.deleteMany({}).exec((err, docs)=> {
        //     if(err){console.log(err)}
        //     console.log("Producto - vaciado")
        // })
        Provedor.deleteMany({}).exec((err, docs)=> {
            if(err){console.log(err)}
            console.log("Provedor - vaciado")
        })
        // Ubicacion.deleteMany({}).exec((err, docs)=> {
        //     if(err){console.log(err)}
        //     console.log("Ubicacion - vaciado")
        // })
        Venta.deleteMany({}).exec((err, docs)=> {
            if(err){console.log(err)}
            console.log("Venta - vaciado")
        })
        VentaItem.deleteMany({}).exec((err, docs)=> {
            if(err){console.log(err)}
            console.log("Venta items - vaciado")
            return res.status(200).send({
                message: 'Restart done!'
            })
        })


    }

}

module.exports = controller;