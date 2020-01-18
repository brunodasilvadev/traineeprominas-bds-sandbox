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
}, { _id: false });

var courseSubSchema = new Schema({
    id: {
        type: Number,
        require: true,
        default: 0
    },
    name: {
        type: String,
        required: [true, 'Nome é um campo obrigatório.'],
        trim: true,
        default: ''
    },
    period: {
        type: Number,
        default: 8
    },
    city: {
        type: String,
        required: [true, 'Cidade é um campo obrigatório.'],
        trim: true,
        default: ''
    },
    teacher: [teacherSubSchema]
}, { _id: false });

var studentSchema = new Schema({
    id: {
        type: Number,
        require: true,
        default: 0
    },
    name: {
        type: String,
        required: [true, 'Nome é um campo obrigatório.'],
        trim: true,
        default: ''
    },
    lastName: {
        type: String,
        required: [true, 'Sobrenome é um campo obrigatório.'],
        trim: true,
        default: ''
    },
    age: {
        type: Number,
        required: [true, 'Idade é um campo obrigatório.'],
        min: [17, 'Apenas alunos maiores que 17 anos são cadastrados.'],
        default: 17
    },
    course: courseSubSchema,
    status: {
        type: Number,
        required: true,
        default: 1
    }
}, { versionKey: false });

module.exports = studentSchema;