var express = require('express');
var router = express.Router();
var controllerTeacher  = require('../controllers/teacher');

// get all teachers
router.get('/teacher/JSON', (req, res, next) => controllerTeacher.findAllByStatusOne(req, res));
// get teachers by id and status active
router.get('/teacher/JSON/:id', (req, res, next) => controllerTeacher.findByIdAndStatusOne(parseInt(req.params.id), req, res));
// insert a teachers
router.post('/teacher', (req, res, next) => controllerTeacher.save(req, res));
// update teacher
router.put('/teacher/:id', (req, res, next) => controllerTeacher.update(parseInt(req.params.id), req, res));
// delete all teachers
router.delete('/teacher', (req, res, next) => controllerTeacher.deleteAll(req, res));
// update teacher status to 0 by id
router.delete('/teacher/:id', (req, res, next) => controllerTeacher.deleteById(parseInt(req.params.id), req, res));

module.exports = router;
