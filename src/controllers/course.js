// Module dependencies
const Joi = require('@hapi/joi');
const courseDB = require("../repository/course");
const mongoose = require('mongoose');
const courseSchema = require('../models/course');
const courseModel = mongoose.model('course', courseSchema, 'course');
const teacherSchema = require('../models/teacher');
const teacherModel = mongoose.model('teacher', teacherSchema, 'teacher');
const studentSchema = require('../models/student');
const studentModel = mongoose.model('student', studentSchema, 'student');
const options = { abortEarly: false };

//Joi validate - course schema
const courseSchemaJoiValidate = Joi.object().keys({
    name: Joi.string().min(2).trim().required()
        .error(() => 'Campo nome é obrigatório. Inserir ao menos 2 caracteres no nome.'),

    period: Joi.number().integer().positive()
        .error(() => 'Campo período deve conter valor numérico.'),

    city: Joi.string().min(2).trim().required()
        .error(() => 'Campo cidade é obrigatório. Inserir ao menos 2 caracteres no nome da cidade.'),

    teacher: Joi.array().items(
        Joi.object({
            id: Joi.number().integer().positive().required().error(() => 'Campo id é obrigatório. Apenas números positivos são aceitos.'),
            name: Joi.string().min(2).trim().required().error(() => 'Campo nome é obrigatório. Inserir ao menos 2 caracteres no nome.'),
            lastName: Joi.string().trim().required().error(() => 'Campo sobrenome é obrigatório.')
        })).min(2).required()
        .error(() => 'É necessário o cadastro de no mínimo 2 professores válidos para o curso.')
});

/* search teachers that exists in database
input: teacher json
output: teacher
*/
function fillTeacher(req, res, callback) {
    var teacher = [];

    if (req.body.teacher === undefined) callback(teacher);

    else if (req.body.teacher.length === 0) callback(teacher);

    else {
        //runs the teacher loop
        for (let key in req.body.teacher) {
            //search by id teacher if exists in database
            teacherModel
                .findOne({ id: parseInt(req.body.teacher[key]), status: 1 }, '-_id').exec(function (errTeacher, docsTeacher) {
                    //if exists, save the teacher body in a variable to return
                    if (docsTeacher !== null) {
                        var teacherItem = {};
                        teacherItem.id = docsTeacher.id;
                        teacherItem.name = docsTeacher.name;
                        teacherItem.lastName = docsTeacher.lastName;
                        teacher.push(teacherItem);
                    }
                    //return teacher existing
                    if (parseInt(key) + 1 === req.body.teacher.length){
                        
                        callback(teacher);
                    }
                });
        }
    }
}

/* search course by status equal 1
return: OK -> all course that has status equal 1 in json
        error -> message
*/
function findAllByStatusOne(req, res) {
    courseModel
        .find({ status: 1 }, '-_id').exec(function (errCourse, docsCourse) {
            //case error show the errors
            if (errCourse) {
                res.status(400).json({
                    status: 'error',
                    error: errCourse.details,
                    message: 'Erro ao buscar cursos.'
                });
            }
            else {
                return Object.keys(docsCourse).length === 0 ?
                    res.status(200).json('Não foram encontrados cursos.') :
                    res.status(200).json(docsCourse);
            }
        });
}

/* search course by id and status equal 1
input: course id
return: OK -> a course in json
        error -> message
*/
function findByIdAndStatusOne(id, req, res) {
    courseModel
        .findOne({ id: parseInt(id), status: 1 }, '-_id').exec(function (errCourse, docsCourse) {
            //case error show the errors
            if (errCourse) {
                res.status(400).json({
                    status: 'error',
                    error: errCourse.details,
                    message: 'Erro ao buscar curso.'
                });
            }
            else {
                return docsCourse === null ?
                    res.status(200).json(`Não foi encontrado curso com o id: ${id}.`) :
                    res.status(200).json(docsCourse);
            }
        });
}

/* insert course
input: course json
return: message
*/
function save(req, res) {
     
    //search teachers that exists in database
    fillTeacher(req, res, (teacherReturn) => {

        //fields to valid with schema
        var courseSchemaToValid = {
            name: typeof req.body.name === 'undefined' ? '' : req.body.name.trim(),
            period: typeof req.body.period === 'undefined' || req.body.period === null ? 8 : parseInt(req.body.period),
            city: typeof req.body.city === 'undefined' ? '' : req.body.city.trim(),
            teacher: teacherReturn
        };
        console.log('courseSchemaToValid'+courseSchemaToValid);
        //validating with Joi Validate...
        const { error, value } = Joi.validate(courseSchemaToValid, courseSchemaJoiValidate, options);

        //case error show the errors
        if (error) {
            res.status(422).json({
                status: 'error',
                error: error.details,
                message: 'Dados informados inválidos'
            });
        }
        else {
            var course = new courseModel();

            //search the id of last user inserted
            courseModel
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
                        //create a course object to save
                        course.id = maxId.length === 0 ? 1 : parseInt(maxId[0].id) + 1;
                        course.name = typeof req.body.name === 'undefined' ? '' : req.body.name.trim();
                        course.period = typeof req.body.period === 'undefined' || req.body.period === null ? 8 : req.body.period;
                        course.city = typeof req.body.city === 'undefined' ? '' : req.body.city.trim();
                        course.teacher = teacherReturn;
                        course.status = 1;

                        //save course
                        course
                            .save()
                            .then(dataInsert => {
                                res.status(201).json({
                                    status: 'success',
                                    message: 'Curso salvo com sucesso.'
                                });
                            }).catch(errInsert => {
                                res.status(400).json({
                                    status: 'error',
                                    error: errInsert,
                                    message: 'Erro ao salvar curso'
                                })
                            });
                    }
                });
        }
    });
}

/* course student by id
input: course id, course json 
return: message
*/
function update(id, req, res) {
    console.log('teste0'+req.body.period);
    //search teachers that exists in database
    fillTeacher(req, res, (teacherReturn) => {
        console.log('teste0'+req.body.period);
        //fields to valid with schema
        var courseSchemaToValid = {
            name: typeof req.body.name === 'undefined' ? '' : req.body.name.trim(),
            period: typeof req.body.period === 'undefined' || req.body.period === null ? 8 : parseInt(req.body.period),
            city: typeof req.body.city === 'undefined' ? '' : req.body.city.trim(),
            teacher: teacherReturn
        };

        //validating with Joi Validate...
        const { error, value } = Joi.validate(courseSchemaToValid, courseSchemaJoiValidate, options);

        //case error show the errors
        if (error) {
            res.status(422).json({
                status: 'error',
                error: error.details,
                message: 'Dados informados inválidos'
            });
        }
        else {
            console.log('teste1')
            courseModel
                .findOne({ id: parseInt(id), status: 1 }, '-_id').exec(function (errCourse, docsCourse) {
                    //case error show the errors
                    if (errCourse) {
                        res.status(400).json({
                            status: 'error',
                            error: errCourse,
                            message: 'Erro ao buscar curso.'
                        });
                    }
                    else {
                        console.log('teste2')
                        if (docsCourse === null) res.status(200).json({ message: `Curso id: ${id} não existente.` });
                        else {
                            //create a course object to save
                            var course = new Object();
                            console.log('teste3' + req.body.period);
                            course.name = typeof req.body.name === 'undefined' ? '' : req.body.name.trim();
                            course.period = req.body.period === null ? 8 : parseInt(req.body.period);
                            course.city = typeof req.body.city === 'undefined' ? '' : req.body.city.trim();
                            course.teacher = teacherReturn;

                            //update teacher
                            courseModel.updateOne({ id: id }, { $set: course }).exec(function (errCourseUpdate, docsCourseUpdate) {
                                if (errCourseUpdate) {
                                    res.status(400).json({
                                        status: 'error',
                                        error: errCourseUpdate,
                                        message: `Erro ao atualizar curso. ${id}`
                                    });
                                }
                                else {
                                    return docsCourseUpdate.nModified > 0 ? res.status(200).json('Curso atualizado com sucesso!')
                                        : res.status(200).json(`Não foi encontrado curso com o id: ${id}.`);
                                }
                            });
                        }
                    }
                });
        }
    });
}

//TODO not inactivate a course that has a student
/* delete all courses -> update to status 0
return: message
*/
function deleteAll(req, res) {
    courseModel
        .find({ status: 1 }, '-_id').exec(function (errCourse, docsCourse) {
            //case error show the errors
            if (errCourse) {
                res.status(400).json({
                    status: 'error',
                    error: errCourse.details,
                    message: 'Erro ao buscar curso.'
                });
            }
            else {
                if (docsCourse.length === 0) res.status(204).send();
                else {
                    courseModel.updateMany({ status: 1 }, { $set: { status: 0 } }).exec(function (errCourseUpdate, docsCourseUpdate) {
                        if (errCourseUpdate) {
                            res.status(400).json({
                                status: 'error',
                                error: errCourseUpdate.details,
                                message: 'Erro ao excluir cursos.'
                            });
                        }
                        else {
                            return docsCourseUpdate.n <= 0 ? res.status(200).json('Não foram encontrados cursos.')
                                : res.status(200).json('Cursos excluídos com sucesso!');
                        }
                    });
                }
            }
        });
}

/* delete course by id -> update course by id and status equal 1 to status 0
input: course id
return: message
*/
function deleteById(id, req, res) {
    //not inactivate a course that has a student
    studentModel
        .findOne({ 'course.id': parseInt(id) }).exec(function (errCourseStudent, docsCourseStudent) {
            //case error show the errors
            if (errCourseStudent) {
                res.status(400).json({
                    status: 'error',
                    error: errCourseStudent.details,
                    message: 'Erro ao buscar curso vinculado a estudante.'
                });
            }
            else {
                if (docsCourseStudent !== null) res.status(200).json('Não é possível excluir um curso que esteja vinculado a algum estudante.');
                else {
                    //verifies if course exists
                    courseModel
                        .findOne({ id: parseInt(id), status: 1 }, '-_id').exec(function (errCourse, docsCourse) {
                            //case error show the errors
                            if (errCourse) {
                                res.status(400).json({
                                    status: 'error',
                                    error: errCourse.details,
                                    message: 'Erro ao buscar curso.'
                                });
                            }
                            else {
                                if (docsCourse === null) res.status(204).send();
                                else {
                                    courseModel.updateOne({ id: id, status: 1 }, { $set: { status: 0 } }).exec(function (errCourseUpdate, docsCourseUpdate) {
                                        if (errCourseUpdate) {
                                            res.status(400).json({
                                                status: 'error',
                                                error: errCourseUpdate.details,
                                                message: `Erro ao excluir curso. ${id}`
                                            });
                                        }
                                        else {
                                            return docsCourseUpdate.nModified > 0 ? res.status(200).json(`Curso excluído com sucesso!`)
                                                : res.status(200).json(`Não foi encontrado curso com o id: ${id}.`);
                                        }
                                    });
                                }
                            }
                        });
                }
            }
        });
}

module.exports = { findAllByStatusOne, findByIdAndStatusOne, save, update, deleteAll, deleteById };
