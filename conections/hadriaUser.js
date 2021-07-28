const globals = require('../globals')
const mongoose = require('mongoose');
const clientOption = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true, // DEBE SER FALSE EN PRODUCCION FIX IT!!!!!!
    useFindAndModify: false,
    poolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
  }
module.exports = function conexionCliente(bd) {

    console.log("Conectando...");
    // const conn = mongoose.createConnection(globals.dbUrl+bd+'?retryWrites=true&w=majority', clientOption)
    const conn = mongoose.createConnection(globals.dbUrl+bd, clientOption)
    conn.model('Balance', require('../schemas/balance'));
    conn.model('Cliente', require('../schemas/cliente'));
    conn.model('CompraItem', require('../schemas/compra_item'));
    conn.model('Compra', require('../schemas/compra'));
    conn.model('Concepto', require('../schemas/concepto'));
    conn.model('Corte', require('../schemas/corte'));
    conn.model('Egreso', require('../schemas/egreso'));
    conn.model('Empaque', require('../schemas/empaque'));
    conn.model('Empleado', require('../schemas/empleado'));
    conn.model('Ingreso', require('../schemas/ingreso'));
    conn.model('Insumo', require('../schemas/insumo'));
    conn.model('Movimiento', require('../schemas/movimiento'));
    conn.model('Pago', require('../schemas/pago'));
    conn.model('PorCobrarCuenta', require('../schemas/porCobrarCuenta'));
    conn.model('PorPagarCuenta', require('../schemas/porPagarCuenta'));
    conn.model('Produccion', require('../schemas/produccion'));
    conn.model('ProduccionItem', require('../schemas/produccionItem'));
    conn.model('Producto', require('../schemas/producto'));
    conn.model('Provedor', require('../schemas/provedor'));
    conn.model('Status', require('../schemas/status'));
    conn.model('TipoCompra', require('../schemas/tipoCompra'));
    conn.model('TipoPago', require('../schemas/tipoPago'));
    conn.model('TipoVenta', require('../schemas/tipoVenta'));
    conn.model('Ubicacion', require('../schemas/ubicacion'));
    conn.model('Unidad', require('../schemas/unidad'));
    conn.model('Venta', require('../schemas/venta'));
    conn.model('VentaItem', require('../schemas/venta_item'));
    conn.on('connected', function(){
      console.log("Conectado -- Modelos Cargados.")
    })
    conn.on('disconnected', function(){
      mongoose.connection.close(() => {
        console.log("Desconectado.");
      })
    })
    conn.on('error', function(err){
      console.log(err)
    })
    return conn; 
}