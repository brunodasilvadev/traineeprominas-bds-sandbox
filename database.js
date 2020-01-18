/* Connecting to Base */
const mongoose = require('mongoose');

require('dotenv').config();

const uri = process.env.mdbUrl;

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
}, function (error){
    if(error){
        console.log(error);
    }
    else{
        console.log('Connected to the database');
    }
});
