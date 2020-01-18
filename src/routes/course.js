var express = require('express');
var router = express.Router();
var controllerCourse  = require('../controllers/course');

// get all courses
router.get('/course/JSON', (req, res, next) => controllerCourse.findAllByStatusOne(req, res));
// get a course by id and status active
router.get('/course/JSON/:id', (req, res, next) => controllerCourse.findByIdAndStatusOne(parseInt(req.params.id), req, res));
// insert a course
router.post('/course', (req, res, next) => controllerCourse.save(req, res));
// update courses
router.put('/course/:id', (req, res, next) => controllerCourse.update(parseInt(req.params.id), req, res));
// delete all courses
router.delete('/course', (req, res, next) => controllerCourse.deleteAll(req, res));
// update course status to 0 by id
router.delete('/course/:id', (req, res, next) => controllerCourse.deleteById(parseInt(req.params.id), req, res));

module.exports = router;
