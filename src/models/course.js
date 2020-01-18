const mongosse = require('mongoose');
const Schema = mongosse.Schema; 

var teacherSubSchema = new Schema({
    id: { 
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
    }
},{ _id : false });

var courseSchema = new Schema({
    id:{
        type: Number,
        require: true,
        default: 0
    },
    name: {
        type: String,
        required: [true, 'Curso é um campo obrigatório.'],
        trim: true,
        default: ""
    }, 
    period: {
        type: Number,
        default: 8
    }, 
    city: {
        type: String,
        required: [true, 'Cidade é um campo obrigatório.'],
        trim: true,
        default: ""
    },
    teacher: [teacherSubSchema],
    status: {
        type: Number,
        required: true,
        default: ""
    }
}, { versionKey: false } );

module.exports = courseSchema ;