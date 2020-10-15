const mongoose = require('mongoose');

const clientOption = {
    socketTimeoutMS: 30000,
    // keepAlive: 30000,
    poolSize: 5,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  };

module.exports = function conexionLobby(){
  const conn = mongoose.createConnection('mongodb+srv://reloadoskar:MuffinTop100685@hdra1-qllhk.mongodb.net/DB_HADRIA2_MASTER?retryWrites=true&w=majority', clientOption);
  conn.once("open", function() {
      console.log("Bienvenido, accesando a HADRIA2");
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