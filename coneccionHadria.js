const mongoose = require('mongoose');

const clientOption = {
    socketTimeoutMS: 30000,
    keepAlive: true,
    poolSize: 50,
    useNewUrlParser: true,
    autoIndex: false,
    useUnifiedTopology: true
  };

const hadriaConnection = () => {
    const db = mongoose.createConnection('mongodb+srv://reloadoskar:MuffinTop100685@hdra1-qllhk.mongodb.net/DB_HADRIA2_MASTER?retryWrites=true&w=majority', clientOption);
    db.model('User', require('./schemas/user'))
    db.on("error", console.error.bind(console, "MongoDB Connection Error>> : "));
    db.once("open", function() {
        console.log("client MongoDB Connection ok!");
    });

    return db;
};

module.exports = hadriaConnection