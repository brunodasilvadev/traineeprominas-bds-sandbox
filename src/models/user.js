const mongosse = require('mongoose');
const Schema = mongosse.Schema; 

var userSchema = new Schema({
    id:{
        type: Number,
        require: true
    },
    name: {
        type: String,
        required: [true, 'Nome é um campo obrigatório.'],
        trim: true
    }, 
    lastName: {
        type: String,
        required: [true, 'Sobrenome é um campo obrigatório.'],
        trim: true
    }, 
    profile: {
        type: String,
        required: [true, 'Profile é um campo obrigatório.'],
        trim: true
    },
    status: {
        type: Number,
        required: true
    }
}, {versionKey: false} );

module.exports = userSchema ;