const globals = {
    dbMaster: `mongodb+srv://${process.env.USER_PASS_DB}@hdra1-qllhk.mongodb.net/DB_HADRIA2_MASTER?retryWrites=true&w=majority`,
    dbUrl: `mongodb+srv://${process.env.USER_PASS_DB}@hdra1-qllhk.mongodb.net/HDR_USR_`
    // dbMaster: 'mongodb://localhost:27017/DB_HADRIA2_MASTER?retryWrites=true&w=majority',
    // dbUrl: 'mongodb://localhost:27017/HDR_USR_'
}

module.exports = globals