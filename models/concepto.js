'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ConceptoSchema = Schema({
    concepto: {type: String, unique: true},

});

// module.exports = mongoose.model('Concepto', ConceptoSchema);
module.exports = ConceptoSchema