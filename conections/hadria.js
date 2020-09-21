const mongoose = require('mongoose');

const clientOption = {
    socketTimeoutMS: 30000,
    keepAlive: true,
    poolSize: 2,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  };

module.exports = function conexionLobby(){
  const conn = mongoose.createConnection('mongodb+srv://reloadoskar:MuffinTop100685@hdra1-qllhk.mongodb.net/DB_HADRIA2_MASTER?retryWrites=true&w=majority', clientOption);
  conn.once("open", function() {
      console.log("Se abrió una conexión a  H A D R I A -- Lobby");
  });
  conn.on('error',(err) =>{
    console.log(err)
  })
  conn.on('close', () => {
    console.log("Cerrando H A D R I A -- Lobby.")
  })
  conn.on('disconnect', () => {
    console.log('Desconectado')
    conn.close()
  })
  return conn
}