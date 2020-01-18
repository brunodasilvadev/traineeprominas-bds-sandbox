var express = require('express');
var router = express.Router();
var controllerStudent  = require('../controllers/student');

// get all students
router.get('/student/JSON', (req, res, next) => controllerStudent.findAllByStatusOne(req, res));
// get a student by id and status active
router.get('/student/JSON/:id', (req, res, next) => controllerStudent.findByIdAndStatusOne(parseInt(req.params.id), req, res));
// insert a student
router.post('/student', (req, res, next) => controllerStudent.save(req, res));
// update student
router.put('/student/:id', (req, res, next)  => controllerStudent.update(parseInt(req.params.id), req, res));
// delete all students
router.delete('/student', (req, res, next)  => controllerStudent.deleteAll(req, res));
// update student status to 0 by id
router.delete('/student/:id', (req, res, next) => controllerStudent.deleteById(parseInt(req.params.id), req, res));

module.exports = router;
