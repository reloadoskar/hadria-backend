const mongoose = require('mongoose');
var connections = 0
const clientOption = {
    // keepAlive: true,
    poolSize: 5,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
};
module.exports = function conexionCliente(bd) {

    const conn = mongoose.createConnection('mongodb+srv://reloadoskar:MuffinTop100685@hdra1-qllhk.mongodb.net/HDR_USR_'+bd+'?retryWrites=true&w=majority', clientOption)
    conn.once("open", function() {
      console.log("Conectado a: USERDB: "+bd);
      console.log(conn.readyState);

    });
    conn.on('error',(err) =>{
      console.log(err)
      conn.close()
    })
    conn.on('close', () => {
      conn.close()
      console.log("Cerrando -- USERDB: "+bd)
      console.log(conn.readyState);
    })
    conn.on('disconnect', () => {
      console.log('Desconectado')
      conn.close()
    })

    conn.model('Cliente', require('../schemas/cliente'));
    conn.model('Compra', require('../schemas/compra'));
    conn.model('CompraItem', require('../schemas/compra_item'));
    conn.model('Concepto', require('../schemas/concepto'));
    conn.model('Corte', require('../schemas/corte'));
    conn.model('Egreso', require('../schemas/egreso'));
    conn.model('Empaque', require('../schemas/empaque'));
    conn.model('Ingreso', require('../schemas/ingreso'));
    conn.model('Insumo', require('../schemas/insumo'));
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

    return conn; 
}