const globals = require('../globals')
const mongoose = require('mongoose');
const clientOption = {
    socketTimeoutMS: 6000,
    // keepAlive: 30000,
    poolSize: 5,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  };
module.exports = function conexionLobby(){
  const conn = mongoose.createConnection(globals.dbMaster, clientOption);
  conn.model('User', require('../schemas/user'))
  conn.once("open", function() {
      console.log("HADRIA_2 On-Line");
  });
  conn.on('error',(err) =>{
    conn.close()
    console.log(err)
  })
  conn.on('close', () => {
    conn.close()
    console.log("Hasta luego")
  })
  conn.on('disconnect', () => {
    conn.close()
    console.log('Desconectado')
  })
  return conn
}