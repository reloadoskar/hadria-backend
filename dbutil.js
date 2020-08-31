const mongoose = require("mongoose");

const clientOption = {
  socketTimeoutMS: 30000,
  keepAlive: true,
  poolSize: 50,
  useNewUrlParser: true,
  autoIndex: false,
  useUnifiedTopology: true
};
const option = { useNewUrlParser: true };

const initDbConnection = () => {
  const db = mongoose.connect('mongodb+srv://reloadoskar:MuffinTop100685@hdra1-qllhk.mongodb.net/DB_HADRIA2_MASTER?retryWrites=true&w=majority', clientOption);

  db.on("error", console.error.bind(console, "MongoDB Connection Error>> : "));
  db.once("open", function() {
    console.log("client MongoDB Connection ok!");
  });
  require("./models/user")
  return db;
};

const userDbConnection = (db) => {
  const dbUser = mongoose.createConnection('mongodb+srv://reloadoskar:MuffinTop100685@hdra1-qllhk.mongodb.net/'+db+'?retryWrites=true&w=majority', clientOption);
  dbUser.on("error", console.error.bind(console, "MongoDb Connection Error<< : "))
  dbUser.once("open", function() {
    console.log("Conectado a la base de datos cliente.")
  })
  return dbUser;
}

module.exports = {
  initDbConnection,
  userDbConnection
};