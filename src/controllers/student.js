// Module dependencies
const Joi = require('@hapi/joi');
var studentDB = require("../repository/student");
const mongoose = require('mongoose');
const courseSchema = require('../models/course');
const courseModel = mongoose.model('course', courseSchema, 'course');
const teacherSchema = require('../models/teacher');
const teacherModel = mongoose.model('teacher', teacherSchema, 'teacher');
const studentSchema = require('../models/student');
const studentModel = mongoose.model('student', studentSchema, 'student');
const options = { abortEarly: false };

//Joi validate - student schema
const studentSchemaJoiValidate = Joi.object().keys({
    name: Joi.string().min(2).trim().required()
        .error(() => 'Campo nome é obrigatório. Inserir ao menos 2 caracteres no nome.'),

    lastName: Joi.string().trim().required()
        .error(() => 'Campo sobrenome é obrigatório.'),

    age: Joi.number().min(17).integer()
        .error(() => 'Somente alunos maiores de 17 anos serão cadastrados. Campo idade deve conter valor numérico.'),

    course:
         Joi.number().integer().positive().required()
            .error(() => 'Campo id é obrigatório. Apenas números positivos são aceitos.')/*,

        name: Joi.string().min(2).trim().required()
            .error(() => 'Campo nome é obrigatório. Inserir ao menos 2 caracteres no nome.'),

        period: Joi.number().integer().positive().default(8)
            .error(() => 'Campo período deve conter valor numérico.'),

        city: Joi.string().min(2).trim().required()
            .error(() => 'Campo cidade é obrigatório. Inserir ao menos 2 caracteres no nome da cidade.'),

        teacher: Joi.array().items(
            Joi.object({
                id: Joi.number().integer().positive().required().error(() => 'Campo id é obrigatório. Apenas números positivos são aceitos.'),
                name: Joi.string().min(2).trim().required().error(() => 'Campo nome é obrigatório. Inserir ao menos 2 caracteres no nome.'),
                lastName: Joi.string().trim().required().error(() => 'Campo sobrenome é obrigatório.')
            })).min(2).required()
            .error(() => 'É necessário o cadastro de no mínimo 2 professores válidos para o curso.')*/

});

/* search teachers that exists in database
input: teacher params
output: teacher existing
*/
function fillTeacher(req, res, callback) {
    var teacher = [];
    var count = 0;
    console.log(req.body.course.teacher)
    if (req.body.course === undefined) callback(teacher);

    else if (req.body.course.teacher === undefined) callback(teacher);

    else {
        console.log('entrou')
        //runs the teacher loop
        for (let key in req.body.course.teacher) {
            //search by id teacher if exists in database
            teacherModel
                .findOne({ id: parseInt(req.body.course.teacher[key]), status: 1 }, '-_id').exec(function (errTeacher, docsTeacher) {
                    //count = count + 1;
                    console.log('docsTeacher ' + docsTeacher);
                    //if exists, save the teacher body in a variable to return
                    if (docsTeacher !== null) {
                        var teacherItem = {};
                        teacherItem.id = docsTeacher.id;
                        teacherItem.name = docsTeacher.name;
                        teacherItem.lastName = docsTeacher.lastName;
                        teacher.push(teacherItem);
                    }

                    //return teacher existing
                    if (parseInt(key) + 1 === req.body.course.teacher.length)
                        callback(teacher);
                });
        }
    }
}

/* search courses that exists in database
input: course params
output: course existing
*/
function fillCourse(req, res, callback) {

    //if doesn't exists course in json, send course null
    if (req.body.course === undefined || req.body.course === {}) callback(0);
    else {
        courseModel
            .findOne({ id: parseInt(req.body.course), status: 1 }, '-_id').exec(function (errCourse, docsCourse) {
             callback(docsCourse);
            });
    }
}

/* search student by status equal 1
return: OK -> all students that has status equal 1 in json
        error -> message
*/
function findAllByStatusOne(req, res) {
    studentModel
        .find({ status: 1 }, '-_id').exec(function (errStudent, docsStudent) {
            //case error show the errors
            if (errStudent) {
                res.status(400).json({
                    status: 'error',
                    error: errStudent.details,
                    message: 'Erro ao buscar estudantes.'
                });
            }
            else {
                return Object.keys(docsStudent).length === 0 ?
                    res.status(200).json({ 'message': 'Não foram encontrados estudantes.' }) :
                    res.status(200).json(docsStudent);
            }
        });
}

/* search student by id and status equal 1
input: student id
return: OK -> a student in json
        error -> message
*/
function findByIdAndStatusOne(id, req, res) {
    studentModel
        .findOne({ id: parseInt(id), status: 1 }, '-_id').exec(function (errStudent, docsStudent) {
            //case error show the errors
            if (errStudent) {
                res.status(400).json({
                    status: 'error',
                    error: errStudent.details,
                    message: 'Erro ao buscar estudante.'
                });
            }
            else {
                return docsStudent === null ?
                    res.status(200).json({ 'message': `Não foi encontrado estudante com o id: ${id}.` }) :
                    res.status(200).json(docsStudent);
            }
        });
}

/* insert student
input:  student json
return: message
*/
function save(req, res) {

    // verifies if course exist in base
    fillCourse(req, res, (course) => {

        if (course === 0) {
            if (req.body.course.id === undefined) res.status(200).json({ message: `Favor inserir um curso válido.` });
            else res.status(200).json({ message: `Curso ${req.body.course.id} inexistente. Favor inserir um curso válido.` });
        }
        else {
            //fillTeacher(req, res, (teacherReturn) => {

                //object course to student
                /*var courseSchemaToValid = {
                    id: course.id,
                    name: course.name,
                    period: parseInt(course.period),
                    city: course.city,
                    teacher: course.teacher
                };*/

                //json student
                var studentSchemaToValid = {
                    name: typeof req.body.name === 'undefined' ? '' : req.body.name.trim(),
                    lastName: typeof req.body.lastName === 'undefined' ? '' : req.body.lastName.trim(),
                    age: typeof req.body.age === 'undefined' ? '' : parseInt(req.body.age),
                    //course: courseSchemaToValid
                    course: parseInt(course.id)
                };
                
                //validating with Joi Validate...
                const { error, value } = Joi.validate(studentSchemaToValid, studentSchemaJoiValidate, options);

                //case error show the errors
                if (error) {
                    res.status(422).json(value);
                }
                else {
                    var student = new studentModel();

                    //search the id of last user inserted
                    studentModel
                        .find({}, 'id').sort({ id: -1 }).limit(1).exec(function (errMaxId, maxId) {
                            //case error show the errors
                            if (errMaxId) {
                                res.status(400).json({
                                    status: 'error',
                                    error: errMaxId.details,
                                    message: 'Erro ao buscar o maior id.'
                                });
                            }
                            else {
                                //create a student object to save
                                //first the course
                                var courseToSave = {};
                                courseToSave.id = course.id;
                                courseToSave.name = course.name;
                                courseToSave.period = course.period;
                                courseToSave.city = course.city;
                                courseToSave.teacher = course.teacher;

                                //create a student object to save
                                student.id = maxId.length === 0 ? 1 : parseInt(maxId[0].id) + 1;
                                student.name = typeof req.body.name === 'undefined' ? '' : req.body.name.trim();
                                student.lastName = typeof req.body.lastName === 'undefined' ? '' : req.body.lastName.trim();
                                student.age = typeof req.body.age === 'undefined' ? '' : parseInt(req.body.age);
                                student.course = courseToSave;
                                student.status = 1;

                                //save student
                                student
                                    .save()
                                    .then(dataInsert => {
                                        res.status(201).json({
                                            status: 'success',
                                            message: 'Estudante salvo com sucesso.'
                                        });
                                    }).catch(errInsert => {
                                        res.status(400).json({
                                            status: 'error',
                                            error: errInsert,
                                            message: 'Erro ao salvar estudante'
                                        })
                                    });
                            }
                        });
                }
            //});
        }
    });
}

/* update student by id
input: student id, student json
return: message
*/
function update(id, req, res) {

    // verifies if course exist in base
    fillCourse(req, res, (course) => {
        if (course === 0) {
            if (req.body.course.id === undefined) res.status(200).json({ message: `Favor inserir um curso.` });
            else res.status(200).json({ message: `Curso ${req.body.course.id} inexistente. Favor inserir um curso válido.` });
        }
        else {
            /*fillTeacher(req, res, (teacherReturn) => {
                //object course to student
                var courseSchemaToValid = {
                    id: typeof req.body.course.id === 'undefined' ? '' : parseInt(req.body.course.id),
                    name: typeof req.body.course.name === 'undefined' ? '' : req.body.course.name.trim(),
                    period: typeof req.body.course.period === 'undefined' ? '' : req.body.course.period,
                    city: typeof req.body.course.city === 'undefined' ? '' : req.body.course.city.trim(),
                    teacher: teacherReturn
                };*/

                //json student
                var studentSchemaToValid = {
                    name: typeof req.body.name === 'undefined' ? '' : req.body.name.trim(),
                    lastName: typeof req.body.lastName === 'undefined' ? '' : req.body.lastName.trim(),
                    age: typeof req.body.age === 'undefined' ? '' : parseInt(req.body.age),
                    //course: courseSchemaToValid
                    course: parseInt(course.id)
                };

                //validating with Joi Validate...
                const { error, value } = Joi.validate(studentSchemaToValid, studentSchemaJoiValidate, options);

                //case error show the errors
                if (error) {
                    res.status(422).json({
                        status: 'error',
                        error: error.details,
                        message: 'Dados informados inválidos'
                    });
                }
                else {
                    studentModel
                        .findOne({ id: parseInt(id), status: 1 }, '-_id').exec(function (errStudent, docsStudent) {
                            //case error show the errors
                            if (errStudent) {
                                res.status(400).json({
                                    status: 'error',
                                    error: errStudent,
                                    message: 'Erro ao buscar estudante.'
                                });
                            }
                            else {
                                if (docsStudent === null) res.status(200).json({ message: `estudante id: ${id} não existente.` });
                                else {
                                    //create a course object to save
                                    var student = new Object();
                                    //create a student object to save
                                    //first the course
                                    var courseToSave = {};
                                    /*courseToSave.id = typeof req.body.course.id === 'undefined' ? '' : parseInt(req.body.course.id);
                                    courseToSave.name = typeof req.body.course.name === 'undefined' ? '' : req.body.course.name.trim();
                                    courseToSave.period = typeof req.body.course.period === 'undefined' ? '' : req.body.course.period;
                                    courseToSave.city = typeof req.body.course.city === 'undefined' ? '' : req.body.course.city.trim();
                                    courseToSave.teacher = teacherReturn;*/

                                    courseToSave.id = course.id;
                                    courseToSave.name = course.name;
                                    courseToSave.period = course.period;
                                    courseToSave.city = course.city;
                                    courseToSave.teacher = course.teacher;

                                    //create a student object to save
                                    student.name = typeof req.body.name === 'undefined' ? '' : req.body.name.trim();
                                    student.lastName = typeof req.body.lastName === 'undefined' ? '' : req.body.lastName.trim();
                                    student.age = typeof req.body.age === 'undefined' ? '' : parseInt(req.body.age);
                                    student.course = courseToSave;
                                    student.status = 1;

                                    //update student
                                    studentModel.updateOne({ id: id }, { $set: student }).exec(function (errStudentUpdate, docsStudentUpdate) {
                                        if (errStudentUpdate) {
                                            res.status(400).json({
                                                status: 'error',
                                                error: errStudentUpdate,
                                                message: `Erro ao atualizar estudante. ${id}`
                                            });
                                        }
                                        else {
                                            return docsStudentUpdate.nModified > 0 ? res.status(200).json({ message: 'Estudante atualizado com sucesso!' })
                                                : res.status(200).json({ message: `Não foi encontrado estudante com o id: ${id}.` });
                                        }
                                    });
                                }
                            }
                        });
                }
            //});
        }
    });
}

/* delete all students -> update to status 0
return: message
*/
function deleteAll(req, res) {
    studentModel
        .find({ status: 1 }, '-_id').exec(function (errStudent, docsStudent) {
            //case error show the errors
            if (errStudent) {
                res.status(400).json({
                    status: 'error',
                    error: errStudent.details,
                    message: 'Erro ao buscar estudante.'
                });
            }
            else {
                if (docsStudent.length === 0) res.status(204).send();
                else {
                    studentModel.updateMany({ status: 1 }, { $set: { status: 0 } }).exec(function (errStudentUpdate, docsStudentUpdate) {
                        if (errStudentUpdate) {
                            res.status(400).json({
                                status: 'error',
                                error: errStudentUpdate.details,
                                message: 'Erro ao excluir estudantes.'
                            });
                        }
                        else {
                            return docsStudentUpdate.n <= 0 ? res.status(200).json({ message: 'Não foram encontrados estudantes.' })
                                : res.status(200).json({ message: 'Estudantes excluídos com sucesso!' });
                        }
                    });
                }
            }
        });
}

/* delete student by id -> update student by id and status equal 1 to status 0
input: student id
return: message
*/
function deleteById(id, req, res) {
    //verifies if student exists
    studentModel
        .findOne({ id: parseInt(id), status: 1 }, '-_id').exec(function (errStudent, docsStudent) {
            //case error show the errors
            if (errStudent) {
                res.status(400).json({
                    status: 'error',
                    error: errStudent.details,
                    message: 'Erro ao buscar estudante.'
                });
            }
            else {
                if (docsStudent === null) res.status(204).send();
                else {
                    studentModel.updateOne({ id: id, status: 1 }, { $set: { status: 0 } }).exec(function (errStudentUpdate, docsStudentUpdate) {
                        if (errStudentUpdate) {
                            res.status(400).json({
                                status: 'error',
                                error: errStudentUpdate.details,
                                message: `Erro ao excluir estudante. ${id}`
                            });
                        }
                        else {
                            return docsStudentUpdate.nModified > 0 ? res.status(200).json({ message: `Estudante com o id: ${id} excluído com sucesso!` })
                                : res.status(200).json({ message: `Não foi encontrado estudante com o id: ${id}.` });
                        }
                    });
                }
            }
        });
}

module.exports = { findAllByStatusOne, findByIdAndStatusOne, save, update, deleteAll, deleteById };
