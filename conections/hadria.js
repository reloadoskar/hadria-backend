const mongoose = require('mongoose');

const clientOption = {
    socketTimeoutMS: 30000,
    keepAlive: true,
    poolSize: 2,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  };

const conn = mongoose.createConnection('mongodb+srv://reloadoskar:MuffinTop100685@hdra1-qllhk.mongodb.net/DB_HADRIA2_MASTER?retryWrites=true&w=majority', clientOption);
conn.on("error", console.error.bind(console, "MongoDB Connection Error>> : "));
conn.once("open", function() {
    console.log("Conectado a HADRIA Master");
});
conn.on('error',(err) =>{
  console.log(err)
})
conn.on('close', () => {
  console.log("Cerrando Hadria Master.")
})
conn.on('disconnect', () => {
  console.log('Desconectado')
  conn.close()
})

module.exports = conn;