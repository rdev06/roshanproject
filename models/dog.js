const mongoose = require('mongoose');
const database = require('../config/database')
mongoose.connect(database.database, {
    useNewUrlParser: true
});
const db = mongoose.connection;

//for successful connection

db.once('open', () => {
    console.log('connected to MongoDB successfully!!!');

});

//for error in connection
db.on('error', (err) => {
    console.log(err);

});

//for defining schema
let articleSchema = mongoose.Schema({
    name: {
        type: String,
        //require: true
    },
    email: {
        type: String,
        //require: true
    },
    password: {
        type: String,
        //require: true
    },
    phone: {
        type: Number,
        //require: true
    },
    total: {
        type: Number,
        //require: true
    },
});

//for defining models

let y = mongoose.model('dog', articleSchema);

//y.remove({_id:y.find({})._id});
//y.find({},(x) => console.log(x));

module.exports = y;
