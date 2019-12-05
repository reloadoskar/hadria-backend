'use strict'
const express = require('express');
const app = express();
var bodyParser = require('body-parser')
var cors = require('cors')

//Middlewares
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors())

//cargar rutas
var producto_routes = require('./routes/producto');
var cliente_routes = require('./routes/cliente');
var provedor_routes = require('./routes/provedor');
var compra_routes = require('./routes/compra');
var ubicacion_routes = require('./routes/ubicacion');
var status_routes = require('./routes/status');
var tipo_compra_routes = require('./routes/tipoCompra');
var tipo_pago_routes = require('./routes/tipoPago');
var ingreso_routes = require('./routes/ingreso');
var egreso_routes = require('./routes/egreso');
var inventario_routes = require('./routes/inventario');
var venta_routes = require('./routes/venta');
var cuentas_por_pagar_routes = require('./routes/porPagarCuenta')
var cuentas_por_cobrar_routes = require('./routes/porCobrarCuenta')
var corte_routes = require('./routes/corte')
var balance_routes = require('./routes/balance')
var user_routes = require('./routes/user')
var unidad_routes = require('./routes/unidad')
var empaque_routes = require('./routes/empaque')
var concepto_routes = require('./routes/concepto')

//Usar rutas
app.use('/api', producto_routes);
app.use('/api', cliente_routes);
app.use('/api', provedor_routes);
app.use('/api', compra_routes);
app.use('/api', ubicacion_routes);
app.use('/api', status_routes);
app.use('/api', tipo_compra_routes);
app.use('/api', tipo_pago_routes);
app.use('/api', ingreso_routes);
app.use('/api', egreso_routes);
app.use('/api', inventario_routes);
app.use('/api', venta_routes);
app.use('/api', cuentas_por_pagar_routes);
app.use('/api', cuentas_por_cobrar_routes);
app.use('/api', corte_routes);
app.use('/api', balance_routes);
app.use('/api', user_routes);
app.use('/api', unidad_routes);
app.use('/api', empaque_routes);
app.use('/api', concepto_routes);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

module.exports = app;