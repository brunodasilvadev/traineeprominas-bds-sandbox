// Module dependencies
const Joi = require('@hapi/joi');
const teacherDB = require('../repository/teacher');
const mongoose = require('mongoose');
const teacherSchema = require('../models/teacher');
const teacherModel = mongoose.model('teacher', teacherSchema, 'teacher');
const courseSchema = require('../models/course');
const courseModel = mongoose.model('course', courseSchema, 'course');
const options = { abortEarly: false };

//JOI validate - teacher schema 
const teacherSchemaJoiValidate = Joi.object().keys({
    name: Joi.string().min(2).trim().required().
        error(() => 'Campo nome é obrigatório. Inserir ao menos 2 caracteres no nome.'),

    lastName: Joi.string().trim().required()
        .error(() => 'Campo sobrenome é obrigatório.'),

    phd: Joi.any().valid(true)
        .error(() => 'Só é possível cadastrar professor com phd true.')
});

/* search teacher by status equal 1
return: OK -> all teachers that has status equal 1 in json
        error -> message
*/
function findAllByStatusOne(req, res) {
    teacherModel
        .find({ status: 1 }, '-_id').exec(function (errTeacher, docsTeacher) {
            //case error show the errors
            if (errTeacher) {
                res.status(400).json({
                    status: 'error',
                    error: errTeacher,
                    message: 'Erro ao buscar professores.'
                });
            }
            else {
                return Object.keys(docsTeacher).length === 0 ?
                    res.status(200).json('Não foram encontrados professores.') :
                    res.status(200).json(docsTeacher);
            }
        });
}

/* search teacher by id and status equal 1
input: teacher id
return: OK -> a teacher in json
        error -> message
*/
function findByIdAndStatusOne(id, req, res) {
    teacherModel
        .findOne({ id: parseInt(id), status: 1 }, '-_id').exec(function (errTeacher, docsTeacher) {
            //case error show the errors
            if (errTeacher) {
                res.status(400).json({
                    status: 'error',
                    error: errTeacher,
                    message: 'Erro ao buscar professor.'
                });
            }
            else {
                return docsTeacher === null ?
                    res.status(200).json(`Não foi encontrado professor com o id: ${id}.`) :
                    res.status(200).json(docsTeacher);
            }
        });
}

/* insert teacher
input: teacher json 
return: message
*/
function save(req, res) {

    //fields to valid with schema
    var teacherSchemaToValid = {
        name: typeof req.body.name === 'undefined' ? '' : req.body.name.trim(),
        lastName: typeof req.body.lastName === 'undefined' ? '' : req.body.lastName.trim(),
        phd: typeof req.body.phd === 'undefined' ? '' : req.body.phd
    };

    //validating with Joi Validate...
    const { error, value } = Joi.validate(teacherSchemaToValid, teacherSchemaJoiValidate, options);

    //case error show the errors
    if (error) {
        res.status(422).json({
            status: 'error',
            error: error.details,
            message: 'Dados informados inválidos.'
        });
    }
    else {
        var teacher = new teacherModel();

        //search the id of last user inserted
        teacherModel
            .find({}, 'id').sort({ id: -1 }).limit(1).exec(function (errMaxId, maxId) {

                //case error show the errors
                if (errMaxId) {
                    res.status(400).json({
                        status: 'error',
                        error: errMaxId,
                        message: 'Erro ao buscar o maior id.'
                    });
                }
                else {
                    //create a teacher object to save
                    teacher.id = maxId.length === 0 ? 1 : parseInt(maxId[0].id) + 1;
                    teacher.name = typeof req.body.name === 'undefined' ? '' : req.body.name.trim();
                    teacher.lastName = typeof req.body.lastName === 'undefined' ? '' : req.body.lastName.trim();
                    teacher.phd = typeof req.body.phd === 'undefined' ? '' : req.body.phd;
                    teacher.status = 1;

                    //save teacher
                    teacher
                        .save()
                        .then(dataInsert => {
                            res.status(201).json({
                                status: 'success',
                                message: 'Professor salvo com sucesso.'
                            });
                        }).catch(errInsert => {
                            res.status(400).json({
                                status: 'error',
                                error: errInsert,
                                message: 'Erro ao salvar professor'
                            })
                        });
                }
            });
    }
}

/* update teacher by id
input: teacher id, teacher json 
return: message
*/
function update(id, req, res) {

    var teacherSchemaToValid = {
        name: typeof req.body.name === 'undefined' ? '' : req.body.name.trim(),
        lastName: typeof req.body.lastName === 'undefined' ? '' : req.body.lastName.trim(),
        phd: typeof req.body.phd === 'undefined' ? '' : req.body.phd
    };

    const { error, value } = Joi.validate(teacherSchemaToValid, teacherSchemaJoiValidate, options);

    if (error) {
        res.status(422).json({
            status: 'error',
            error: error.details,
            message: 'Dados informados inválidos'
        });
    }
    else {
        teacherModel
            .findOne({ id: parseInt(id), status: 1 }, '-_id').exec(function (errTeacher, docsTeacher) {
                //case error show the errors
                if (errTeacher) {
                    res.status(400).json({
                        status: 'error',
                        error: errTeacher,
                        message: 'Erro ao buscar professor.'
                    });
                }
                else {
                    if (teacherModel === null) res.status(200).json({ message: `Professor id: ${id} não existente.` });
                    else {
                        //create a teacher object to save
                        var teacher = new Object();
                        teacher.name = typeof req.body.name === 'undefined' ? '' : req.body.name.trim();
                        teacher.lastName = typeof req.body.lastName === 'undefined' ? '' : req.body.lastName.trim();
                        teacher.phd = typeof req.body.phd === 'undefined' ? '' : req.body.phd;

                        //update teacher
                        teacherModel.updateOne({ id: id }, { $set: teacher }).exec(function (errTeacherUpdate, docsTeacherUpdate) {
                            if (errTeacherUpdate) {
                                res.status(400).json({
                                    status: 'error',
                                    error: errTeacherUpdate.details,
                                    message: `Erro ao atualizar professor. ${id}`
                                });
                            }
                            else {
                                return docsTeacherUpdate.nModified > 0 ? res.status(200).json('Professor atualizado com sucesso!')
                                    : res.status(200).json({ message: `Não foi encontrado professor com o id: ${id}.` });
                            }
                        });
                    }
                }
            });
    }
}

//TODO don't delete a teacher that to be in a course
/* delete all teachers -> update to status 0
return: message
*/
function deleteAll(req, res) {
    teacherModel
        .find({ status: 1 }, '-_id').exec(function (errTeacher, docsTeacher) {
            //case error show the errors
            if (errTeacher) {
                res.status(400).json({
                    status: 'error',
                    error: errTeacher,
                    message: 'Erro ao buscar professores.'
                });
            }
            else {
                if (docsTeacher.length === 0) res.status(204).send();
                else {
                    teacherModel.updateMany({ status: 1 }, { $set: { status: 0 } }).exec(function (errTeacherUpdate, docsTeacherUpdate) {
                        if (errTeacherUpdate) {
                            res.status(400).json({
                                status: 'error',
                                error: errTeacherUpdate,
                                message: 'Erro ao excluir professores.'
                            });
                        }
                        else {
                            return docsTeacherUpdate.n <= 0 ? res.status(200).json({ message: 'Não foram encontrados professores.' })
                                : res.status(200).json({ message: 'Professores excluídos com sucesso!' });
                        }
                    });
                }
            }
        });
}

/* delete teacher by -> update teacher by id and status equal 1 to status 0
input: teacher id
return: message
*/
async function deleteById(id, req, res) {
    let teacherCourse = await courseModel.findOne({ 'teacher.id': parseInt(id) });

    if (!teacherCourse) {

        let teacher = await teacherModel.findOne({ id: parseInt(id), status: 1 }, '-_id');

        if (teacher) {
            let session = await mongoose.startSession();
            session.startTransaction();
            try {
                const opts = { session, new: true };
                const teacherUpdate = await teacherModel.updateOne({ id: id, status: 1 }, { $set: { status: 0 } }, opts);
                await session.commitTransaction();
                session.endSession();
                return teacherUpdate.nModified > 0 ? res.status(200).json(`Professor excluído com sucesso!`)
                    : res.status(200).json({ message: `Não foi encontrado professor com o id: ${id}.` });
            }
            catch (err) {
                await session.abortTransaction();
                session.endSession();
                throw err;
            }
        }
        else {
            res.status(204).send();
        }
    }
    else {
        res.status(200).json('Não é possível excluir um professor que esteja vinculado a algum curso.');
    }
}

module.exports = { findAllByStatusOne, findByIdAndStatusOne, save, update, deleteAll, deleteById };
