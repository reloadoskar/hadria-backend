'use strict'
var mongoose = require('mongoose')

const conexion_app = require('../conections/hadria')
const con = require('../conections/hadriaUser')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
var curDate = new Date()
var curDateISO = curDate.toISOString()
var tryPeriod = curDate.setDate(curDate.getDate() + 30)
tryPeriod = new Date(tryPeriod).toISOString()
process.env.SECRET_KEY = 'secret'

var controller = {
    getEmpleados: async (req, res) => {
        const bd= req.params.bd
        const conn = con(bd)
        
        try{
            var Empleado = conn.model('Empleado', require("../schemas/empleado"))
            var ubicacion = conn.model('Ubicacion', require("../schemas/ubicacion"))
            const r = await Empleado.find()
                .select('nombre sexo level instagram facebook email telefono ubicacion')            
                .populate('ubicacion')
                .lean()
            conn.close()
            return res.status(200).send({
                status: "success",
                message: "Ok",
                empleados: r
            })
        } catch(error){
            console.error(error)
        }
    },
    addEmpleado: (req, res) => {
        const conn = conexion_app()
        const bd = req.params.bd
        const conn2 = con(bd)
        const params = req.body
        // console.log(params)
        var User = conn.model('User')
        var Empleado = conn2.model('Empleado', require("../schemas/empleado"))
        // Creo un usuario para accesar a BD
        try{
            var nusr = new User()
            if(params.area.level < 5){
                nusr.level = params.level
                nusr.nombre = params.nombre
                nusr.telefono = params.telefono
                nusr.email = params.email
                nusr.database = bd
                nusr.fechaInicio = curDateISO
                nusr.tryPeriodEnds = tryPeriod
                nusr.paidPeriodEnds = tryPeriod
                bcrypt.hash(params.password, 10, (err, hash) =>{
                    nusr.password = hash
                    nusr.save()
                })
            }
            //Creo un Empleado en BD local
            var nempleado = new Empleado()
            nempleado._id = nusr._id
            nempleado.nombre = params.nombre
            nempleado.edad = params.edad
            nempleado.level = params.area.level
            nempleado.sexo = params.sexo
            nempleado.ubicacion = params.ubicacion
            nempleado.direccion = params.direccion
            nempleado.telefono = params.telefono
            nempleado.email = params.email
            nempleado.instagram = params.instagram
            nempleado.facebook = params.facebook
            nempleado.save((err, usrSvd) => {
                if(err){console.log(err)}
                return res.status(200).send({
                    status: "success",
                    message: "Empleado creado correctamente",
                    usrSvd
                })
            })
        } catch(err){
            console.error(err)
        }     

    },
    delEmpleado: (req,res) =>{
        return false
    },
    save: (req, res) => {
        
        const {email, password, nombre, apellido} = req.body;
        const conn = conexion_app()
        var User = conn.model('User');
        var Empleado = conn.model('Empleado')
        User.estimatedDocumentCount((err, count) => {
            if (err) console.log(err)
            const user = new User();
            user.nombre = nombre
            user.apellido = apellido
            user.email = email
            user.password = password
            user.database = count+1
            user.level = 1
            user.fechaInicio = curDateISO
            user.tryPeriodEnds = tryPeriod
            user.paidPeriodEnds = tryPeriod



            User.findOne({
                email: email
            })
            .then(usr => {
                if(!usr){
                    //Creo un Empleado en BD local
                    var nempleado = new Empleado()
                    nempleado._id = usr._id
                    nempleado.nombre = params.area.level
                    nempleado.edad = params.edad
                    nempleado.level = params.area.level
                    nempleado.sexo = params.sexo
                    nempleado.ubicacion = params.ubicacion
                    nempleado.direccion = params.direccion
                    nempleado.telefono = params.telefono
                    nempleado.email = params.email
                    nempleado.instagram = params.instagram
                    nempleado.facebook = params.facebook

                    nempleado.save()
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
        try{
        const conn = conexion_app()
        const User = conn.model('User', require('../schemas/user') );
        const {email, password} = req.body;
            User.findOne({
                email: email
            })
            .then(user => {
                if(user){
                    if(bcrypt.compareSync(password, user.password)){
                        let conn2 = con(user.database)
                        const Empleado = conn2.model('Empleado', require('../schemas/empleado'))
                        const Ubicacion = conn2.model('Ubicacion', require('../schemas/ubicacion'))
                        Empleado.findById(user._id).populate('ubicacion').exec((err, emp) => {
                            if(err || !emp){console.log(err)}
                            const payload = {
                                _id: emp._id,
                                nombre: emp.nombre,
                                apellido: emp.apellido,
                                email: emp.email,
                                ubicacion: emp.ubicacion,
                                level: emp.level,
                                database: user.database,
                                tryPeriodEnds: user.tryPeriodEnds,
                                paidPeriodEnds: user.paidPeriodEnds,
                            }
                            let token = jwt.sign(payload, process.env.SECRET_KEY, {
                                expiresIn: '1h'
                            })
                            return res.status(200).send({
                                status: 'success',
                                message: 'Bienvenido '+payload.nombre,
                                token
                            })
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
        }catch(err){
            console.log(err)
            return res.status(500).send({
                status: "error",
                message: "No hay conectividad con la red.",
                err
            })
        }
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
        const Movimiento = conn.model('Movimiento', require('../schemas/movimiento'))
        
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
        Corte.deleteMany({}).exec((err, docs)=> {
            if(err){console.log(err)}
            console.log("Corte - vaciado")
        })
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
        // Provedor.deleteMany({}).exec((err, docs)=> {
        //     if(err){console.log(err)}
        //     console.log("Provedor - vaciado")
        // })
        // Ubicacion.deleteMany({}).exec((err, docs)=> {
        //     if(err){console.log(err)}
        //     console.log("Ubicacion - vaciado")
        // })
        Venta.deleteMany({}).exec((err, docs)=> {
            if(err){console.log(err)}
            console.log("Venta - vaciado")
        })
        Movimiento.deleteMany({}).exec((err, docs)=> {
            if(err){console.log(err)}
            console.log("Movimientos - vaciado")
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