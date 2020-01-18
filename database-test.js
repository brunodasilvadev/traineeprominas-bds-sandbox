/* Connecting to Base */
const mongoose = require('mongoose');

const uri = 'mongodb+srv://brunosilva:brunosilva123@cluster0-mga2y.mongodb.net/trainee-prominas-test?retryWrites=true&w=majority';

mongoose.connect(uri, {
    useNewUrlParser: true
}, function (error){
    if(error){
        console.log(error);
    }
    else{
        console.log('Connected to the database');
    }
});
