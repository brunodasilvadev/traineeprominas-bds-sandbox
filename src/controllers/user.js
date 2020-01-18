// Module dependencies
const Joi = require('@hapi/joi');
const userDB = require('../repository/user');
const mongoose = require('mongoose');
const userSchema = require('../models/user');
const userModel = mongoose.model('user', userSchema, 'user');
const options = { abortEarly: false };

//Joi validate - user schema
const userSchemaJoiValidate = Joi.object().keys({
    name: Joi.string().min(2).trim().required().
        error(() => 'Campo nome é obrigatório. Inserir ao menos 2 caracteres no nome.'),

    lastName: Joi.string().trim().required()
        .error(() => 'Campo sobrenome é obrigatório.'),

    profile: Joi.any().valid(['admin', 'guess']).required()
        .error(() => 'Campo profile é obrigatório. Apenas perfis admin e guess são aceitos.'),
});

/* search user by status equal 1
return: OK -> all users that has status equal 1 in json
        error -> message
*/
function findAllByStatusOne(req, res) {
    userModel
        .find({ status: 1 }, '-_id').exec(function (errUser, docsUser) {
            //case error show the errors
            if (errUser) {
                res.status(400).json({
                    status: 'error',
                    error: errUser,
                    message: 'Erro ao buscar usuários.'
                });
            }
            else {
                return Object.keys(docsUser).length === 0 ?
                    res.status(200).json({ message: 'Não foram encontrados usuários.'}) :
                    res.status(200).json(docsUser);
            }
        });
}

/* search user by id and status equal 1
input: user id
return: OK -> a user in json
        error -> message
*/
function findByIdAndStatusOne(id, req, res) {
    userModel
        .findOne({ id: parseInt(id), status: 1 }, '-_id').exec(function (errUser, docsUser) {
            //case error show the errors
            if (errUser) {
                res.status(400).json({
                    status: 'error',
                    error: errUser,
                    message: 'Erro ao buscar usuário.'
                });
            }
            else {
                return docsUser === null ?
                    res.status(200).json(`Não foi encontrado usuário com o id: ${id}.`) :
                    res.status(200).json(docsUser);
            }
        });
}

/* insert user
input: user json
return: message
*/
function save(req, res) {

    //fields to valid with schema
    var userSchemaToValid = {
        name: typeof req.body.name === 'undefined' ? '' : req.body.name.trim(),
        lastName: typeof req.body.lastName === 'undefined' ? '' : req.body.lastName.trim(),
        profile: typeof req.body.profile === 'undefined' ? '' : req.body.profile.trim()
    };

    //validating with Joi Validate...
    const { error, value } = Joi.validate(userSchemaToValid, userSchemaJoiValidate, options);

    //case error show the errors
    if (error) {
        res.status(422).json({
            status: 'error',
            error: error.details,
            message: 'Dados informados inválidos'
        });
    }
    else {
        var user = new userModel();

        //search the id of last user inserted
        userModel
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
                    //create a user object to save
                    user.id = maxId.length === 0 ? 1 : parseInt(maxId[0].id) + 1;
                    user.name = typeof req.body.name === 'undefined' ? '' : req.body.name.trim();
                    user.lastName = typeof req.body.lastName === 'undefined' ? '' : req.body.lastName.trim();
                    user.profile = typeof req.body.profile === 'undefined' ? '' : req.body.profile.trim();
                    user.status = 1;

                    //save user
                    user
                        .save()
                        .then(dataInsert => {
                            res.status(201).json({
                                status: 'success',
                                message: 'Usuário salvo com sucesso.'
                            });
                        }).catch(errInsert => {
                            res.status(400).json({
                                status: 'error',
                                error: errInsert,
                                message: 'Erro ao salvar usuário'
                            })
                        });
                }
            });
    }
}

/* update user by id
input: user id, user json 
return: message
*/
function update(id, req, res) {

    //fields to valid with schema
    var userSchemaToValid = {
        name: typeof req.body.name === 'undefined' ? '' : req.body.name.trim(),
        lastName: typeof req.body.lastName === 'undefined' ? '' : req.body.lastName.trim(),
        profile: typeof req.body.profile === 'undefined' ? '' : req.body.profile.trim()
    };

    //validating with Joi Validate...
    const { error, value } = Joi.validate(userSchemaToValid, userSchemaJoiValidate, options);

    //case error show the errors
    if (error) {
        res.status(422).json({
            status: 'error',
            error: error.details,
            message: 'Dados informados inválidos'
        });
    }
    else {
        userModel
            .findOne({ id: parseInt(id), status: 1 }, '-_id').exec(function (errUser, docsUser) {
                //case error show the errors
                if (errUser) {
                    res.status(400).json({
                        status: 'error',
                        error: errUser.details,
                        message: 'Erro ao buscar usuário.'
                    });
                }
                else {
                    if (docsUser === null) res.status(200).json({ message: `Usuário id: ${id} não existente.` });
                    else {
                        //create a user object to save
                        var user = new Object();
                        user.name = typeof req.body.name === 'undefined' ? '' : req.body.name.trim();
                        user.lastName = typeof req.body.lastName === 'undefined' ? '' : req.body.lastName.trim();
                        user.profile = typeof req.body.profile === 'undefined' ? '' : req.body.profile.trim();

                        //update user
                        userModel.updateOne({ id: id }, { $set: user }).exec(function (errUserUpdate, docsUserUpdate) {
                            if (errUserUpdate) {
                                res.status(400).json({
                                    status: 'error',
                                    error: errUserUpdate,
                                    message: `Erro ao atualizar usuário. ${id}`
                                });
                            }
                            else {
                                return docsUserUpdate.nModified > 0 ? res.status(200).json({ message: 'Usuário atualizado com sucesso!' })
                                    : res.status(200).json({ message: `Não foi encontrado usuário com o id: ${id}.` });
                            }
                        });
                    }
                }
            });
    }
}

/* delete all users -> update to status 0
return: message
*/
function deleteAll(req, res) {
    userModel
        .find({ status: 1 }, '-_id').exec(function (errUser, docsUser) {
            //case error show the errors
            if (errUser) {
                res.status(400).json({
                    status: 'error',
                    error: errUser,
                    message: 'Erro ao buscar usuários.'
                });
            }
            else {
                if (docsUser.length === 0) res.status(204).send();
                else {
                    userModel.updateMany({ status: 1 }, { $set: { status: 0 } }).exec(function (errUserUpdate, docsUserUpdate) {
                        if (errUserUpdate) {
                            res.status(400).json({
                                status: 'error',
                                error: errUserUpdate,
                                message: 'Erro ao excluir usuários.'
                            });
                        }
                        else {
                            return docsUserUpdate.n <= 0 ? res.status(200).json({ message: 'Não foram encontrados usuários.' })
                                : res.status(200).json({ message: 'Usuários excluídos com sucesso!' });
                        }
                    });
                }
            }
        });
}

/* delete user by id -> update user by id and status equal 1 to status 0
input: user id
return: message
*/
function deleteById(id, req, res) {
    //verifies if user exists
    userModel
        .findOne({ id: parseInt(id), status: 1 }, '-_id').exec(function (errUser, docsUser) {
            //case error show the errors
            if (errUser) {
                res.status(400).json({
                    status: 'error',
                    error: errUser,
                    message: 'Erro ao buscar usuário.'
                });
            }
            else {
                if (docsUser === null) res.status(204).send();
                else {
                    userModel.updateOne({ id: id, status: 1 }, { $set: { status: 0 } }).exec(function (errUserUpdate, docsUserUpdate) {
                        if (errUserUpdate) {
                            res.status(400).json({
                                status: 'error',
                                error: errUserUpdate,
                                message: `Erro ao excluir usuário. ${id}`
                            });
                        }
                        else {
                            return docsUserUpdate.nModified > 0 ? res.status(200).json({ message: 'Usuário excluído com sucesso!' })
                                : res.status(200).json({ message: `Não foi encontrado usuário com o id: ${id}.` });
                        }
                    });
                }
            }
        });
}

module.exports = { findAllByStatusOne, findByIdAndStatusOne, save, update, deleteAll, deleteById };
