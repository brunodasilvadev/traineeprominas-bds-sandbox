var express = require('express');
var router = express.Router();
var controllerUser  = require('../controllers/user');

//get all users
router.get('/user/JSON', (req, res, next) => controllerUser.findAllByStatusOne(req, res));
// get users by id and status active
router.get('/user/JSON/:id',(req, res, next) => controllerUser.findByIdAndStatusOne(parseInt(req.params.id), req, res));
// insert a users
router.post('/user', (req, res, next) => controllerUser.save(req, res));
// update users
router.put('/user/:id', (req, res, next) => controllerUser.update(parseInt(req.params.id), req, res));
// delete all users
router.delete('/user', (req, res, next) => controllerUser.deleteAll(req, res));
// update user status to 0 by id
router.delete('/user/:id', (req, res, next) => controllerUser.deleteById(parseInt(req.params.id), req, res));

module.exports = router;
