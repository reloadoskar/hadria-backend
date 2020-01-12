'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StatusSchema = Schema({
    nombre: {type: String, unique: true},
},{
    timestamps: true
});

// module.exports = mongoose.model('Status', StatusSchema);
module.exports = StatusSchema