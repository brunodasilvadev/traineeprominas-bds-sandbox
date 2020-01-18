const mongosse = require('mongoose');
const Schema = mongosse.Schema; 

var teacherSchema = new Schema({
    id:{
        type: Number,
        require: true
    },
    name: {
        type: String,
        required: [true, 'Nome é um campo obrigatório.' ],
        trim: true
    }, 
    lastName: {
        type: String,
        required: [true, 'Sobrenome é um campo obrigatório.' ],
        trim: true
    }, 
    phd: {
        type: Boolean
        
    },
    status: {
        type: Number,
        required: true
    }
}, {versionKey: false} );

module.exports =  teacherSchema ;