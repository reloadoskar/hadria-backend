const mongoose = require('mongoose');

const clientOption = {
    socketTimeoutMS: 30000,
    keepAlive: true,
    poolSize: 5,
    useNewUrlParser: true,
    useUnifiedTopology: true
  };

const conn = mongoose.createConnection('mongodb+srv://reloadoskar:MuffinTop100685@hdra1-qllhk.mongodb.net/DB_HADRIA2_MASTER?retryWrites=true&w=majority', clientOption);
conn.on("error", console.error.bind(console, "MongoDB Connection Error>> : "));
conn.once("open", function() {
    console.log("client MongoDB Connection ok!");
});

module.exports = conn;