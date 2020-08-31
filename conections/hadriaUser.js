const mongoose = require('mongoose');

module.exports = function coneccionCliente(bd) {
    const conn = mongoose.createConnection('mongodb+srv://reloadoskar:MuffinTop100685@hdra1-qllhk.mongodb.net/HDR_USR_'+bd+'?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true})
  
    return conn; 
  };